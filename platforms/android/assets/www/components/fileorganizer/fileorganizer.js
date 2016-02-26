define(["paperdialoghelper","paper-checkbox","paper-input","paper-button"],function(e){function t(e){Dashboard.hideLoadingMsg(),Dashboard.alert({title:Globalize.translate("AutoOrganizeError"),message:Globalize.translate("ErrorOrganizingFileWithErrorCode",e.getResponseHeader("X-Application-Error-Code"))})}function n(e,n){!n.ExtractedName||n.ExtractedName.length<4?e.querySelector(".fldRemember").classList.add("hide"):e.querySelector(".fldRemember").classList.remove("hide"),$(".inputFile",e).html(n.OriginalFileName),$("#txtSeason",e).val(n.ExtractedSeasonNumber),$("#txtEpisode",e).val(n.ExtractedEpisodeNumber),$("#txtEndingEpisode",e).val(n.ExtractedEndingEpisodeNumber),$(".extractedName",e).html(n.ExtractedName),o=n.ExtractedName,a=n.ExtractedYear,$("#chkRememberCorrection",e).val(!1),$("#hfResultId",e).val(n.Id),ApiClient.getItems(null,{recursive:!0,includeItemTypes:"Series",sortBy:"SortName"}).then(function(t){s=t.Items.map(function(e){return'<option value="'+e.Id+'">'+e.Name+"</option>"}).join(""),s='<option value=""></option>'+s,$("#selectSeries",e).html(s)},t)}function i(n){Dashboard.showLoadingMsg();var i=$("#hfResultId",n).val(),r={SeriesId:$("#selectSeries",n).val(),SeasonNumber:$("#txtSeason",n).val(),EpisodeNumber:$("#txtEpisode",n).val(),EndingEpisodeNumber:$("#txtEndingEpisode",n).val(),RememberCorrection:$("#chkRememberCorrection",n).checked()};ApiClient.performEpisodeOrganization(i,r).then(function(){Dashboard.hideLoadingMsg(),n.submitted=!0,e.close(n)},t)}function r(e){require(["components/itemidentifier/itemidentifier"],function(t){t.showFindNew(o,a,"Series").then(function(t){l=t;var n=s;null!=l&&(n=n+'<option selected value="##NEW##">'+l.Name+"</option>"),$("#selectSeries",e).html(n)})})}var o,a,l,s;return{show:function(t){return new Promise(function(d,c){o=null,a=null,l=null,s=null;var u=new XMLHttpRequest;u.open("GET","components/fileorganizer/fileorganizer.template.html",!0),u.onload=function(){var o=this.response,a=e.createDialog({removeOnClose:!0,size:"small"});a.classList.add("ui-body-a"),a.classList.add("background-theme-a"),a.classList.add("formDialog");var l="";l+=Globalize.translateDocument(o),a.innerHTML=l,document.body.appendChild(a),a.querySelector(".dialogHeaderTitle").innerHTML=Globalize.translate("FileOrganizeManually"),e.open(a),a.addEventListener("iron-overlay-closed",function(){a.submitted?d():c()}),a.querySelector(".btnCancel").addEventListener("click",function(){e.close(a)}),a.querySelector("form").addEventListener("submit",function(e){return i(a),e.preventDefault(),!1}),a.querySelector("#btnNewSeries").addEventListener("click",function(){r(a)}),n(a,t)},u.send()})}}});