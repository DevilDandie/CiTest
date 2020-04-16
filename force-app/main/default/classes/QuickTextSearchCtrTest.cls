@IsTest
private class QuickTextSearchCtrTest {
    @IsTest
    static void testQuickTextSearchCtr() {

        QuickText quickText = new QuickText();
        quickText.Name = 'Test Quick Text';
        quickText.Category = 'FAQ';
        quickText.Message = 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.';
        insert quickText;

        QuickText quickText2 = new QuickText();
        quickText2.Name = 'Test Quick Text 2';
        quickText2.Message = 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.';
        insert quickText2;

        Test.setFixedSearchResults(
                new Id[]{
                        quickText.Id,
                        quickText2.Id
                }
        );

        String[] searchTerms = new String[]{
                'Lorem', 'Text'
        };

        Test.startTest();

        List<Map<String, String>> categories = QuickTextSearchCtr.getCategories();
        System.assert(categories.size() > 0);
        QuickTextSearchCtr.ItemWrapper[] resultList1 = QuickTextSearchCtr.search(searchTerms, null);
        System.assertEquals(2, resultList1.size());

        QuickTextSearchCtr.ItemWrapper[] resultList2 = QuickTextSearchCtr.search(new String[]{
        }, null);

        System.assertEquals(2, resultList2.size());

        QuickTextSearchCtr.ItemWrapper[] resultList3 = QuickTextSearchCtr.search(searchTerms, 'FAQ');

        System.assertEquals(1, resultList3.size());
        System.assertEquals(1, resultList3.size());

        QuickTextSearchCtr.setBookmark(resultList1[0].qtx.Id);

        System.assertEquals(1, QuickTextSearchCtr.showBookmarks().size());

        QuickTextSearchCtr.deleteBookmark(resultList1[0].qtx.Id);

        System.assertEquals(0, QuickTextSearchCtr.showBookmarks().size());

        Test.stopTest();
    }
}