﻿define(['ironCardList', 'scrollThreshold', 'events', 'libraryBrowser', 'jQuery'], function (ironCardList, scrollThreshold, events, libraryBrowser, $) {

    return function (view, params, tabContent) {

        var self = this;
        var pageSize = libraryBrowser.getDefaultPageSize();

        var data = {};

        function getPageData(context) {
            var key = getSavedQueryKey(context);
            var pageData = data[key];

            if (!pageData) {
                pageData = data[key] = {
                    query: {
                        SortBy: "SortName",
                        SortOrder: "Ascending",
                        IncludeItemTypes: "Series",
                        Recursive: true,
                        Fields: "PrimaryImageAspectRatio,SortName,SyncInfo",
                        ImageTypeLimit: 1,
                        EnableImageTypes: "Primary,Backdrop,Banner,Thumb",
                        StartIndex: 0,
                        Limit: pageSize
                    },
                    view: libraryBrowser.getSavedView(key) || libraryBrowser.getDefaultItemsView('Poster', 'Poster')
                };

                pageData.query.ParentId = params.topParentId;
                libraryBrowser.loadSavedQueryValues(key, pageData.query);
            }
            return pageData;
        }

        function getQuery(context) {

            return getPageData(context).query;
        }

        function getSavedQueryKey(context) {

            if (!context.savedQueryKey) {
                context.savedQueryKey = libraryBrowser.getSavedQueryKey('series');
            }
            return context.savedQueryKey;
        }

        function setCardOptions(result) {

            var cardOptions;

            var view = self.getCurrentViewStyle();

            if (view == "Thumb") {

                cardOptions = {
                    items: result.Items,
                    shape: "backdrop",
                    preferThumb: true,
                    context: 'tv',
                    lazy: true,
                    overlayPlayButton: true
                };
            }
            else if (view == "ThumbCard") {

                cardOptions = {
                    items: result.Items,
                    shape: "backdrop",
                    preferThumb: true,
                    context: 'tv',
                    lazy: true,
                    cardLayout: true,
                    showTitle: true,
                    showSeriesYear: true
                };
            }
            else if (view == "Banner") {

                cardOptions = {
                    items: result.Items,
                    shape: "banner",
                    preferBanner: true,
                    context: 'tv',
                    lazy: true
                };
            }
            else if (view == "List") {

                html = libraryBrowser.getListViewHtml({
                    items: result.Items,
                    context: 'tv',
                    sortBy: query.SortBy
                });
            }
            else if (view == "PosterCard") {
                cardOptions = {
                    items: result.Items,
                    shape: "portrait",
                    context: 'tv',
                    showTitle: true,
                    showYear: true,
                    lazy: true,
                    cardLayout: true
                };
            }
            else {

                // Poster
                cardOptions = {
                    items: result.Items,
                    shape: "portrait",
                    context: 'tv',
                    centerText: true,
                    lazy: true,
                    overlayPlayButton: true
                };
            }

            self.cardOptions = cardOptions;
        }

        function reloadItems(page) {

            self.isLoading = true;
            Dashboard.showLoadingMsg();

            var query = getQuery(page);
            var startIndex = query.StartIndex;
            var reloadList = !self.cardOptions || startIndex == 0;

            ApiClient.getItems(Dashboard.getCurrentUserId(), query).then(function (result) {

                updateFilterControls(page);

                var pushItems = true;
                if (reloadList) {
                    setCardOptions(result);
                    pushItems = false;
                }
                libraryBrowser.setPosterViewData(self.cardOptions);
                libraryBrowser.setPosterViewDataOnItems(self.cardOptions, result.Items);

                var ironList = page.querySelector('#ironList');
                if (pushItems) {
                    for (var i = 0, length = result.Items.length; i < length; i++) {
                        ironList.push('items', result.Items[i]);
                    }
                } else {
                    ironList.items = result.Items;
                }

                // Hack: notifyResize needs to be done after the items have been rendered
                setTimeout(function () {
                    ironList.notifyResize();
                    self.scrollThreshold.resetSize();
                }, 300);

                libraryBrowser.saveQueryValues(getSavedQueryKey(page), query);

                Dashboard.hideLoadingMsg();
                self.hasMoreItems = result.TotalRecordCount > (startIndex + result.Items.length);
                self.isLoading = false;
            });
        }

        self.showFilterMenu = function () {

            require(['components/filterdialog/filterdialog'], function (filterDialogFactory) {

                var filterDialog = new filterDialogFactory({
                    query: getQuery(tabContent),
                    mode: 'series'
                });

                Events.on(filterDialog, 'filterchange', function () {
                    getQuery(tabContent).StartIndex = 0;
                    reloadItems(tabContent);
                });

                filterDialog.show();
            });
        }

        function updateFilterControls(tabContent) {

            var query = getQuery(tabContent);
            $('.alphabetPicker', tabContent).alphaValue(query.NameStartsWith);
        }

        function initPage(tabContent) {

            $('.alphabetPicker', tabContent).on('alphaselect', function (e, character) {

                var query = getQuery(tabContent);
                query.NameStartsWithOrGreater = character;
                query.StartIndex = 0;

                reloadItems(tabContent);

            }).on('alphaclear', function (e) {

                var query = getQuery(tabContent);
                query.NameStartsWithOrGreater = '';
                getQuery(tabContent).StartIndex = 0;

                reloadItems(tabContent);
            });

            tabContent.querySelector('.btnFilter').addEventListener('click', function () {
                self.showFilterMenu();
            });

            tabContent.querySelector('.btnSort').addEventListener('click', function (e) {
                libraryBrowser.showSortMenu({
                    items: [{
                        name: Globalize.translate('OptionNameSort'),
                        id: 'SortName'
                    },
                    {
                        name: Globalize.translate('OptionImdbRating'),
                        id: 'CommunityRating,SortName'
                    },
                    {
                        name: Globalize.translate('OptionDateAdded'),
                        id: 'DateCreated,SortName'
                    },
                    {
                        name: Globalize.translate('OptionDatePlayed'),
                        id: 'DatePlayed,SortName'
                    },
                    {
                        name: Globalize.translate('OptionMetascore'),
                        id: 'Metascore,SortName'
                    },
                    {
                        name: Globalize.translate('OptionParentalRating'),
                        id: 'OfficialRating,SortName'
                    },
                    {
                        name: Globalize.translate('OptionPlayCount'),
                        id: 'PlayCount,SortName'
                    },
                    {
                        name: Globalize.translate('OptionReleaseDate'),
                        id: 'PremiereDate,SortName'
                    }],
                    callback: function () {
                        getQuery(tabContent).StartIndex = 0;
                        reloadItems(tabContent);
                    },
                    query: getQuery(tabContent),
                    button: e.target
                });
            });

            tabContent.querySelector('.btnSelectView').addEventListener('click', function (e) {

                libraryBrowser.showLayoutMenu(e.target, self.getCurrentViewStyle(), 'Banner,List,Poster,PosterCard,Thumb,ThumbCard'.split(','));
            });

            tabContent.querySelector('.btnSelectView').addEventListener('layoutchange', function (e) {

                var viewStyle = e.detail.viewStyle;

                getPageData(tabContent).view = viewStyle;
                libraryBrowser.saveViewSetting(getSavedQueryKey(tabContent), viewStyle);
                getQuery(tabContent).StartIndex = 0;
                reloadItems(tabContent);
            });
        }

        self.getCurrentViewStyle = function () {
            return getPageData(tabContent).view;
        };

        initPage(tabContent);

        function createList() {

            if (self.listCreated) {
                return Promise.resolve();
            }

            return ironCardList.getTemplate('seriesTab').then(function (html) {

                tabContent.querySelector('.itemsContainer').innerHTML = html;
                self.listCreated = true;

                return new Promise(function (resolve, reject) {

                    setTimeout(resolve, 2000);
                });
            });
        }

        function loadMoreItems() {

            if (!self.isLoading && self.hasMoreItems) {

                getQuery(tabContent).StartIndex += pageSize;
                reloadItems(tabContent);
            }
        }

        self.scrollThreshold = new scrollThreshold(tabContent, false);
        events.on(self.scrollThreshold, 'lower-threshold', loadMoreItems);

        self.renderTab = function () {

            createList().then(function () {
                reloadItems(tabContent);
                updateFilterControls(tabContent);
            });
        };

        self.destroy = function () {
            events.off(self.scrollThreshold, 'lower-threshold', loadMoreItems);
            if (self.scrollThreshold) {
                self.scrollThreshold.destroy();
            }
        };
    };
});