({

    performSearch: function (component, pagination) {

        var searchTerm = component.get('v.searchTerm');
        component.set('v.isLoading', true);
        if (typeof (searchTerm) == 'undefined') {
            searchTerm = '';
        } else {
            this.updateHistory(component, searchTerm);
        }
        var searchTermArray = [];
        searchTermArray = searchTerm.split(' ').filter(function (value) {
            return value.length > 0;
        });
        window.DataService.exec('search', component, {
            terms: searchTermArray,
            category: component.get('v.selectedCategory'),
            recordId: component.get('v.recordId')
        })
            .then(function (result) {
                this.finalizeSearch(component, result, pagination);
            }.bind(this))
            .catch(function (error) {
                this.finalizeSearch(component, [], pagination);
            }.bind(this))
        ;
    },

    finalizeSearch: function (component, result, pagination) {
        component.set('v.result', result);
        component.set('v.isLoading', false);
        pagination.paginate(result);
    },

    updateHistory: function (component, searchHistoryItem) {
        var history = component.get('v.searchHistory');
        if (searchHistoryItem.length > 0 && !history.includes(searchHistoryItem)) {
            if (history.length > 9) {
                history.shift();
            }
            history.push(searchHistoryItem);
        }
        component.set('v.searchHistory', history);
    }
})