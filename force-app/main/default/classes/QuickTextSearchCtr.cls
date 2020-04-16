public with sharing class QuickTextSearchCtr {
    final static String SPECIAL_CHARACTERS = '([\\&\\|\\!\\(\\)\\{\\}\\[\\]\\^"\\~\\?:\'+\\-])';
    final static Id userId = System.UserInfo.getUserId();
    @AuraEnabled
    public static List<Map<String, String>> getCategories() {
        List<Map<String, String>> picklistValues = new List<Map<String, String>>();
        Schema.DescribeFieldResult fieldResult = QuickText.Category.getDescribe();
        List<Schema.PicklistEntry> picklistEntries = fieldResult.getPicklistValues();

        for (Schema.PicklistEntry pickListVal : picklistEntries) {
            picklistValues.add(
                    new Map<String, String>{
                            'value' => pickListVal.getValue(),
                            'label' => pickListVal.getLabel()
                    }
            );
        }

        return picklistValues;
    }

    @AuraEnabled
    public static ItemWrapper[] search(String[] terms, String category) {
        QuickTextCustom__c customQtext = new QuickTextCustom__c();
        for (QuickTextCustom__c customQ : [
                SELECT Id,
                        UserId__c,
                        Bookmarks__c
                FROM QuickTextCustom__c
                WHERE UserId__c = :userId
        ]) {
            customQtext = customQ;
        }
        Set<String> bookmarkSet = new Set<String>();
        if (customQtext != null && customQtext.Bookmarks__c != null) {
            bookmarkSet = new Set<String>(customQtext.Bookmarks__c.split(';'));
        }

        if (terms == null || terms.size() == 0) {
            List<QuickText> res = new List<QuickText>();
            if (category == null || category == 'All') {
                res = new List<QuickText>([
                        SELECT Id,
                                Name,
                                Message,
                                Category,
                                Channel,
                                Folder.Name
                        FROM QuickText
                        LIMIT 50
                ]);
            } else {
                res = new List<QuickText>([
                        SELECT Id,
                                Name,
                                Message,
                                Category,
                                Channel,
                                Folder.Name
                        FROM QuickText
                        WHERE Category = :category
                ]);
            }
            return populateBookmarksAndWrap(res, bookmarkSet);
        }

        String[] sanitizedStringList = new String[]{
        };

        for (String term : terms) {
            if (!term.endsWith('*')) {
                term += '*';
            }
            sanitizedStringList.add('"' + QuickTextSearchCtr.sanitizeSOSLCharacters(term) + '"');
        }

        String finalSearchTerm = String.join(sanitizedStringList, ' AND ');
        String query = 'FIND {';
        query += finalSearchTerm + '}';
        query += ' RETURNING QuickText(Id, Name, Message, Category, Channel, Folder.Name ';
        if (category != null && category != 'All') {
            query += ' WHERE Category = \'' + String.escapeSingleQuotes(category) + '\'';
        }
        query += ')';

        List<List<SObject>>searchResult = Search.query(query);
        return populateBookmarksAndWrap((QuickText[]) searchResult[0], bookmarkSet);
    }

    @AuraEnabled
    public static List<ItemWrapper> showBookmarks() {
        QuickTextCustom__c customQtext = new QuickTextCustom__c();
        for (QuickTextCustom__c customQ : [
                SELECT Id,
                        UserId__c,
                        Bookmarks__c
                FROM QuickTextCustom__c
                WHERE UserId__c = :userId
        ]) {
            customQtext = customQ;
        }
        Set<String> bookmarkSet = new Set<String>();
        List<QuickText> res = new List<QuickText>();
        if (customQtext != null && customQtext.Bookmarks__c != null) {
            bookmarkSet = new Set<String>(customQtext.Bookmarks__c.split(';'));
        }
        if (!bookmarkSet.isEmpty()) {
            res = new List<QuickText>([
                    SELECT Id,
                            Name,
                            Message,
                            Category,
                            Channel,
                            Folder.Name
                    FROM QuickText
                    WHERE Id IN:bookmarkSet
            ]);
        }
        return populateBookmarksAndWrap(res, bookmarkSet);
    }

    private static List<ItemWrapper> populateBookmarksAndWrap(QuickText[] results, Set<String> bookmarkSet) {
        if (results != null && !results.isEmpty()) {
            List<ItemWrapper> result = new List<ItemWrapper>();
            for (QuickText qt : (QuickText[]) results) {
                boolean isBookmarked = bookmarkSet.contains(qt.Id);
                result.add(new ItemWrapper(qt, isBookmarked));
            }
            return result;
        }
        return new List<ItemWrapper>();
    }

    @AuraEnabled
    public static void setBookmark(String bookmarkId) {
        QuickTextCustom__c customQtext;
        for (QuickTextCustom__c customQ : [
                SELECT Id,
                        UserId__c,
                        Bookmarks__c
                FROM QuickTextCustom__c
                WHERE UserId__c = :userId
        ]) {
            customQtext = customQ;
        }
        if (customQtext == null) {
            customQtext = new QuickTextCustom__c(UserId__c = userId);
        }
        if (customQtext.Bookmarks__c != null) {
            customQtext.Bookmarks__c += (bookmarkId + ';');
        } else {
            customQtext.Bookmarks__c = (bookmarkId + ';');
        }
        upsert customQtext UserId__c;
    }

    @AuraEnabled
    public static void deleteBookmark(String bookmarkId) {
        QuickTextCustom__c customQtext = ([
                SELECT Id,
                        UserId__c,
                        Bookmarks__c
                FROM QuickTextCustom__c
                WHERE UserId__c = :userId
        ]);
        if (customQtext == null) {
            customQtext = new QuickTextCustom__c(UserId__c = userId);
        }
        if (customQtext.Bookmarks__c != null) {
            customQtext.Bookmarks__c = customQtext.Bookmarks__c.remove(bookmarkId + ';');
            update customQtext;
        }
    }

    private static String sanitizeSOSLCharacters(String input) {
        return input.replaceAll(SPECIAL_CHARACTERS, '\\\\$1');
    }

    public class ItemWrapper {
        @AuraEnabled public Boolean isBookmarked;
        @AuraEnabled public QuickText qtx;
        public ItemWrapper(QuickText qtx, Boolean isBookmarked) {
            this.qtx = qtx;
            this.isBookmarked = isBookmarked;
        }
    }
}