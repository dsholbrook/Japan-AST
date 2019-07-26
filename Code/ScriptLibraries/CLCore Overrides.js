/**

File input widget.
<br />
<br />Automatically creates the file input widget onload based on the presence	and value of the 
magic @data-widget="fileinput" attribute on the tab container. And optional "data-multiple" setting is available 
but your server-side processing must be able to support it (array parameters).
<br />
<br />Usage:
	
	<input id="myInputField1" type="file" data-widget="fileinput" />

__Special case:__ In scenarios where you dynamically inject file input element HTML post-load, you can initialize the widget on your injected input HTML like this:
	
	$("#myInputId").fileinput();
	
Allowed options and values. __All values are strings__ (html standards):
<br />__data-widget__: fileinput
<br />__data-multiple__: true | false (default)  &nbsp; // Allows multiple attachments

@class CLCore.common.widget.fileinput

**/

(function ($, IBM, CLC) {

var me = IBM.namespace(CLC, "common.widget.fileinput"),
	fileInputWidgets = [],
	object_name = "Fileinput";

/**
	Public jQuery plug-in definition.
	<br />Used by core v18 JS file to auto-init file input HTML that exist on the page on DOM ready.
	<br />If you are dynamically injecting and initing file inputs post-load, call this plug-in on your injected input.

	@method $.fn.clcfileinput
	@param [settings] {Object} Settings to override defaults and element's @data-xxxx attributes.
**/
$.fn.clcfileinput = function (settings) {
	return this.each(function(){
		var d = createFileinput(settings);
		d.init($(this));
	});
};


/**
	Called by our jQuery plug-in.
	<br />This creates a new file input object and registers the instance into array of all this widget instances.
	<br />The jQuery plugin abstracts this and makes behind-the-scenes changes easy.
	
	@method createFileinput
	@private
	@param [settings] {Object} Settings to override defaults and element's @data-xxxx attributes.
	@return {Object} The widget object instance created.
**/
function createFileinput (settings) {
	var newInputWidget = new Fileinput(settings);

	fileInputWidgets.push(newInputWidget);
	
	return newInputWidget;
}

/**
	Publishes this event if the widget was disabled and didn't init.
	
	@event disabled
**/
/**
	Publishes this event if there was an error creating the widget.
	
	@event error
**/
/**
	Publishes this event after the widget has been created successfully.
	
	@event ready
**/
/**
	File input object/constructor for our public jQuery plugin.
	<br />Called by "createFileinput".
	<br />You can't use this directly. Use the standard $(xxxx).fileinput() plug-in method to dynamically 
	init and create a file input widget.

	@method Fileinput
	@constructor
	@private
	@param [settings] {Object} Settings to override defaults and element's @data-xxxx attributes.
**/
function Fileinput (settings) {
	var $el,
		$widgetContainer,
		me = this,
		myEvents = IBM.common.util.eventCoordinator(me, object_name, [
			"ready",
			"disabled",
			"error"
		]),
		filesControlContainerHtml = '<span></span>',
		filesControlAddFileHtml = '<button href="#" class="ibm-browsebutton ibm-btn-pri ibm-btn-gray-50 ibm-btn-small">Browse</button>',
		filesControlRemoveFileHtml = '<a href="#" class="ibm-inlinelink ibm-remove-link" role="button" aria-label="Remove">Remove</a>',
		filesControlWrapperHtml = '<span class="ibm-fileinput"></span>';

    /**
		This is a method of the "Fileinput" constructor.
		<br />Called by our public jQuery plug-in after a new file input object has been created and returned by "createFileinput".
		<br />Automatically inits the file input plug-in on the passed element, 
		merging in any manually passed settings, @data-xxxxx settings, and our default settings. 
		
		@method init
		@param $elem {jQuery selector} The element you want to turn into a file input widget.
	**/
	me.init = init;
	function init ($elem) {
		try {
			if (!IBM.common.util.checkClearance("fileinput")) {
				myEvents.publish("disabled");
				return false;
			}
			
			$el = $elem;

			$el.data("widget", me);

			setupInitialControls($elem);

			// Fire an event to tell subscribers we're done.
			myEvents.publish("ready");
		} 
		catch (er) {
			myEvents.publish("error", er);
			throw er;
		}
	}

	/**
		Use the inbound element (input@file) and adjust it's name if needed based on type.

		@method adjustInputName
		@private
		@param el {jQuery selector} The element you want to turn into a file input widget.
		@return {jQuery selector} Returns the passed jQuery selector/element, but with new @name.
	**/
	function adjustInputName ($thisEl) {
		var elName = $thisEl.attr("name"),
			newName = elName || "uploadFile";
			
		if (!elName && $el.data("multiple")) {
			newName += "[]";
		} 
		else if (elName && $el.data("multiple")) {
			newName = elName + "[]";
		}

		// Now change and return it as needed.
		return $thisEl.attr("name", newName);
	}
	
	/**
		Creates a new file input control clone/template to inject when needed.

		@method createNewFileInput
		@private
	**/
	function createNewFileInput () {
		return adjustInputName($el.clone());	
	}
	
	/**
		Takes or creates a file input and wraps it in the ibm-fileinput wrapper with associated add/remove controls.

		@method createNewFileInputContainer
		@private
		@param $input {jQuery input selector} The file input to create a container/widget for.
		@param {jQuery object} The new input wrapper container.
	**/
	function createNewFileInputContainer ($input) {
		var $newInput = ($input || createNewFileInput()).change(doFileChange),
			newEl = $(filesControlWrapperHtml).append($(filesControlAddFileHtml).click(doUploadClick)).append($newInput);
	
		return newEl;
	}
	
	/**
		Setup the initial set of controls (add/remove and new input) and replace original with this.
		<br />This kills the original $elem. Always use $el.clone or $widgetContainer for the outer span wrapper.

		@method setupInitialControls
		@private
		@param $elem {jQuery selector} The input element to setup file upload controls for, for the widget.
	**/
	function setupInitialControls ($elem) {
		var $newFileInputContainer;
		
		// Quit if we're not in a proper column or row form.
		if (!$elem.closest("form").hasClass("ibm-column-form") && !$elem.closest("form").hasClass("ibm-row-form")) {
			return false;
		}
		
		// Create object for the file control set and append the new file input object we just created.
		// This creates <span ibm-fileinput> and everything in it.
		$newFileInputContainer = createNewFileInputContainer();

		// Wrap it in our outer <span>.
		// NOTE: This is a one-time deal PER original file input.
		$newFileInputContainer.wrap(filesControlContainerHtml);

		$widgetContainer = $newFileInputContainer.parent();
		
		// Inject into DOM where the original input was and remove original.
		$elem.parent().before($newFileInputContainer.parent());
		$elem.parent().remove();
	}

	/**
		Creates or updates file upload control text/container.

		@method adjustFileInputControlLinks
		@private
	**/
	function adjustFileInputControlLinks () {
		var numFileControls = $widgetContainer.children(".ibm-fileinput").length;
		
		// If there's no controls (it was a single and we removed it) add a set.
		if (numFileControls === 0) {
			$widgetContainer.html(createNewFileInputContainer());
		}
		else if (numFileControls === 1) {
			$("a.ibm-browsebutton", $widgetContainer).html("Browse");
		}
	}
	
	
	
	/**
		Callback for clicking on "Remove" button.
		<br />case 1: If we click on Browse, a file chooser popup will open and allows us to browse and select the file
		<br />case 2: If we click on Remove, either of the cases will be executes
		<br />case 2.a: For Sigle file browse, the elemnt is replaced with Browse option
		<br />case 2.b: for file multi browser, it replaces the remove with browse button if there exists with only remove option
			else, it destroys the remove option.

		@method doRemoveClick
		@private
		@param evt {Event} The click event.
	**/
	function doRemoveClick (evt) {
		evt.preventDefault();
		
		// Remove this control set (span.ibm-fileinput)
		$(evt.currentTarget).closest(".ibm-fileinput").remove();
		
		// Eval the current controls and decide if we need to adjust texts (multi)
		//  or add a missing upload control (if single and we just remove *the* one.
		adjustFileInputControlLinks();
	}
	
	/**
		Callback for clicking the "Browse" (upload) link/button.

		@method doUploadClick
		@private
		@param evt {Event} The click event.
	**/
	function doUploadClick (evt) {
		evt.preventDefault();
		$("input[type=file]", evt.currentTarget.parentElement)[0].click();
	}
	
	/**
		When we select a file from file chooser, this onchange() function will be invoked:
		<br />Displays selected file name, removed "browse" button and adds "remove" button.
		<br />If it's a multi-input class: adds "add another" link which adds another set of input controls.

		@method doFileChange
		@private
		@param evt {Event} The onclick event.
	**/	
	function doFileChange (evt) {
		var $fileInput = $(evt.currentTarget),
			$form = $(evt.currentTarget).closest("form"),
			fileName = $fileInput.val().split("\\"),
			fileNameShort = fileName,
			$removeButton = $(filesControlRemoveFileHtml).click(doRemoveClick),
			$newFileContolContainer = createNewFileInputContainer();
		
		// Get the file name that was just selected, and create a short name to fit in the column width.
		if (fileName.length > 1) {
			fileName = fileName[fileName.length - 1] ;
		}
		else {
			fileName = fileName[0];
		} 
		
		if ($form[0].className.indexOf("column-form") > 0 && fileName.length > 30) {
			fileNameShort = fileName.substring(0, 14) + "..." + fileName.substring((fileName.length - 10), fileName.length);
		}
		else if ($form[0].className.indexOf("row-form") > 0 && fileName.length > 15) {
			fileNameShort = fileName.substring(0, 6) + "..." + fileName.substring((fileName.length - 7), fileName.length);
		} else {
			fileNameShort = fileName;
		}						

		// Inject a "remove" button,
		// Inject the selected file name (since the input is hidden),
		// Remove the "upload" button.
		$fileInput.before($removeButton.attr("aria-label", "Remove " + fileName)).after("<span>(" + fileNameShort +  ")</span>").siblings(".ibm-browsebutton").remove();
		
		// If this control was a single upload, stop.
		if (!$el.data("multiple")) {
			return;
		}
		
		// Otherwise, let's make another set of controls.
		// This creates <span ibm-fileinput> and everything in it.
		$newFileContolContainer.children("a").attr("aria-label", "Add another file").html("Add another file");
		$fileInput.closest(".ibm-fileinput").after($newFileContolContainer);
	}
}

})(jQuery, IBMCore, CLCore);


//---- Override TEMP

/**

Table row selector widget. 
<br />
<br />Binds the checkbox in the table row to provide a visual cue that the row is selected by adding a class that changes the row background.
<br />Automatically binds the table based on the presence and value of the magic @data-tablerowselector attribute on the table.
<br />
<br />Usage:
	
<table data-tablerowselector="enable" cellspacing="0" cellpadding="0"........>

__Special case:__ In scenarios where you dynamically inject table HTML post page load, you can initialize the widget on your injected table like this:
	
$("table_I_injected").tablesrowselector();

@class IBMCore.common.widget.tablerowselector

**/

(function ($, IBM) {

var me = IBM.namespace(IBM, "common.widget.tablesrowselector");

/**
	Public jQuery plug-in definition.
	<br />Used by core v18 JS file to auto-init tables HTML that have the data-widget attribute that exist on the page on DOM ready.
	<br />If you are dynamically injecting table/row HTML post-load, call this plug-in on your injected &lt;table>.

	@method $.fn.tablesrowselector
**/
$.fn.tablesrowselector = function () {
	return this.each(function(){
		createTableRowSelector(this);
	});
};

	/**
	Called by our jQuery plug-in.
	<br />This initializes a new table row selector widget on the passed table DOM element.
	<br />The jQuery plugin abstracts this and makes behind-the-scenes changes easy.
	
	@method createTableRowSelector
	@private
	@param el {DOM element} The table element to add the table row selector widget to.
**/
function createTableRowSelector (tableEl) {
	// When a TBODY row checkbox is selected, add/remove class to it's parent TR (colors it).
	$("tbody tr input:checkbox", $(tableEl)).on("click ifToggled", function () {
		$(this).closest("tr")[this.checked ? "addClass" : "removeClass"]("ibm-row-selected");
	});
	
	// When a checkbox is in the thead, it's to select/deselect every row checkbox/
	// So add/remove class to EVERY TR in the table body,
	//   and check each row's checkbox
	$("thead tr input:checkbox", $(tableEl)).on("click ifToggled", function () {
		var checkboxChecked = this.checked;
		
		$(this).closest("thead").siblings("tbody").children("tr").each(function () {
			var $tr = $(this);

			if (checkboxChecked) {
				$tr.addClass("ibm-row-selected");
				
				// If they have the forms checkbox plug-in on the page, or are using table in a form.
				if ($.fn.iCheck) {
					$("td:eq(0) input:checkbox , th:eq(0) input:checkbox", $tr).iCheck("check");
				}
				else {
					$("td:eq(0) input:checkbox , th:eq(0) input:checkbox", $tr).prop("checked", true);
				}
			}
			else {
				$tr.removeClass("ibm-row-selected");
				
				// If they have the forms checkbox plug-in on the page, or are using table in a form.
				if ($.fn.iCheck) {
					$("td:eq(0) input:checkbox , th:eq(0) input:checkbox", $tr).iCheck('uncheck');
				}
				else {
					$("td:eq(0) input:checkbox , th:eq(0) input:checkbox", $tr).prop("checked", false);
				}
			}
		});
	});
}

})(jQuery, IBMCore);

