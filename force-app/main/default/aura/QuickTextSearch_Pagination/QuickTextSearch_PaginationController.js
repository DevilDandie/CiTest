({
    handleChange: function (component, event, helper) {
        helper.paginateResult(event.getParam('value'), component);
    },
    handlePaginationAction: function (component, event, helper) {
        const params = event.getParam('arguments');

        helper.paginateResult(params.list, component);
        component.set('v.items', params.list);
    },
    gotoPage: function (component, event, helper) {
        helper.gotoPage(component, event.getSource().get('v.value'));
    }
})