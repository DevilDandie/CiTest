({
    init: function (component, event, helper) {
        const data = component.get('v.data.qtx');
        component.set('v.isBookmarked', component.get('v.data.isBookmarked'));
        var searchTerm = component.get('v.searchTerm');
        const displayData = {
            MessagePreview: helper.markText(helper.trimTextToFindingRange(data.Message, searchTerm), searchTerm),
            Message: helper.markText(data.Message, searchTerm),
            Name: helper.markText(data.Name, searchTerm)
        };
        component.set('v.displayData', displayData);
    },


    handleCopyClick: function (component, event, helper) {
        const copyEvent = $A.get('e.c:QuickTextSearch_CopyEvent');
        copyEvent.setParams({
            quickText: component.get('v.data.qtx')
        });
        copyEvent.fire();
    },

    handleBookmarkClick: function (component, event, helper) {
        if (!component.get('v.isBookmarked')) {
            var action = component.get('c.setBookmark');
            action.setParams({
                bookmarkId: component.get("v.data.qtx.Id")
            });
            action.setCallback(this, function (response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    component.set('v.isLoading', true);
                    component.set('v.isBookmarked', !component.get('v.isBookmarked'));
                    component.set('v.isLoading', false);
                }
            });
            $A.enqueueAction(action);
        } else {
            action = component.get('c.deleteBookmark');
            action.setParams({
                bookmarkId: component.get("v.data.qtx.Id")
            });
            action.setCallback(this, function (response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    component.set('v.isLoading', true);
                    component.set('v.isBookmarked', !component.get('v.isBookmarked'));
                    component.set('v.isLoading', false);
                }
            });
            $A.enqueueAction(action);
        }

    },
    toggleVisibility: function (component, event, helper) {
        component.set('v.textVisible', !component.get('v.textVisible'));
    }
})