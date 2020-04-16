({
    prepareMessage: function (message) {
        const htmlEscapes = {
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;'
        };
        const htmlEscaper = new RegExp('[<>"\'\/]', 'g');
        return ('' + message).replace(htmlEscaper, function (match) {
            return htmlEscapes[match];
        });
    },

    markText: function (text, subject) {
        subject = subject.replace('*', '.');
        const subjectList = subject.split(' ').join('|');
        const regex = new RegExp('(' + subjectList + ')', 'gmi');
        return this.prepareMessage(text).replace(regex, '<mark>$1</mark>');
    },
    trimTextToFindingRange: function (text, searchTerm) {
        searchTerm = searchTerm.replace('*', '.');
        const subjectList = searchTerm.split(' ').join('|');
        const regex = new RegExp('(' + subjectList + ')', 'mi');
        const match = text.match(regex);
        if (match === null) {
            return text.substring(0, text.length < 125 ? text.length : 125);
        }
        const snipStart = (match.index - 25 < 0) ? 0 : match.index - 25;
        const snipEnd = (match.index + 95 > text.length) ? text.length : match.index + 95;
        return (snipStart > 0 ? '…' : '') + text.substring(snipStart, snipEnd) + (snipEnd < text.length ? '…' : '');
    }
})