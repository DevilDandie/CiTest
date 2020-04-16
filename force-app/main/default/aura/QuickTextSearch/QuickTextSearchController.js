({

    init: function (component, event, helper) {
    },

    scriptsLoaded: function (component, helper) {

        component.set(
            'v.debounceHandler',
            window.debounce(
                $A.getCallback(
                    function (c, e, h) {
                        h.performSearch(c, c.find('pagination'))
                    }
                ),
                300
            )
        );
        window
            .DataService
            .exec('getCategories', component, {})
            .then(function (categories) {
                component.set('v.textCategories', categories);
            })
        ;
        $A.enqueueAction(component.get('c.handleSearch'));
    },

    handleSearch: function (component, event, helper) {
        component.set('v.isLoading', true);
        const fn = component.get('v.debounceHandler');
        if (typeof fn === 'function') {
            fn(component, event, helper);
        }
    },

    copyToClipboard: function (component, event, helper) {
        const textarea = document.getElementById('clipboard');
        textarea.select();
        document.execCommand('copy');
    },

    handleCopyEvent: function (component, event, helper) {

        try {
            const data = event.getParam('quickText');
            const textarea = document.getElementById('clipboard');
            textarea.value = data.Message;
            textarea.select();
            document.execCommand('copy');
            component.set('v.copyBadgeActive', true);
            setTimeout($A.getCallback(
                function () {
                    component.set('v.copyBadgeActive', false);
                }
            ), 2000);
        } catch (e) {
            component.set('v.copyBadgeActive', false);
        }
    },

    handleSearchHistoryMode: function (component, event, helper) {
        component.set('v.isLoading', true);
        if (component.get('v.bookmarksMode')) {
            component.set('v.bookmarksMode', !component.get('v.bookmarksMode'));
            component.set('v.result', null);
            component.find('pagination').paginate([]);
        }
        component.set('v.searchMode', !component.get('v.searchMode'));
        component.set('v.isLoading', false);
    },

    handleBookmarksMode: function (component, event, helper) {
        if (!component.get('v.searchMode')) {
            component.set('v.searchMode', !component.get('v.searchMode'));
        }
        if (!component.get('v.bookmarksMode')) {
            component.set('v.isLoading', true);
            window.DataService.exec('showBookmarks', component, {}).then(function (result) {
                component.set('v.result', result);
                component.find('pagination').paginate(result);
                component.set('v.isLoading', false);
            }.bind(this));
        } else {
            component.set('v.isLoading', true);
            $A.enqueueAction(component.get('c.handleSearch'));
            component.set('v.isLoading', false);
        }
        component.set('v.bookmarksMode', !component.get('v.bookmarksMode'));
    }
});