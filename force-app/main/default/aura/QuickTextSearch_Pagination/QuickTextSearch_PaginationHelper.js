({
    gotoPage: function (component, page) {
        if (typeof page === 'string') {
            page = parseInt(page);
        }
        component.set('v.displayedItems', this.buildListByPageNumber(page, component.get('v.itemsPerPage'), component.get('v.items')));
        component.set('v.currentPage', page);
    },

    paginateResult: function (list, component) {

        if (typeof list === 'undefined') {
            return;
        }
        const itemsPerPage = component.get('v.itemsPerPage');
        let numberOfPages = Math.floor(list.length / itemsPerPage) + ~~(list.length % itemsPerPage > 0);

        component.set('v.pages', numberOfPages);
        component.set('v.currentPage', 1);
        component.set('v.paginationEntries', this.buildPagination(numberOfPages, 1));
        component.set('v.displayedItems', this.buildListByPageNumber(1, itemsPerPage, list));

    },

    buildPagination: function (pages, startPage) {
        let paginationEntries = new Array(pages >= 5 ? 5 : pages).fill(startPage).map(function (item, index) {
            return {
                index: item + index,
                label: item + index,
                message: null
            }
        });

        return paginationEntries;
        if (pages > 5) {
            paginationEntries.push({
                index: -1,
                label: '...',
                message: $A.get('$Label.c.QuickTextSearchMoreResults')
                // (pages - 3) + ' more page' + ((pages - 3 > 1) ? 's' : '') + '...'
            });
        }

        return paginationEntries;
    },
    buildListByPageNumber: function (pageNumber, itemsPerPage, list) {

        // calculate the upper index for slicing items from original list
        const upperBounds = ((pageNumber - 1) * itemsPerPage + itemsPerPage);

        // extract items for current page
        const displayedList = list.slice(
            (pageNumber - 1) * itemsPerPage,
            upperBounds > list.length ? list.length : upperBounds
        );

        return displayedList;
    }
})