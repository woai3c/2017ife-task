(() => {

function $(selector) {
    return document.querySelector(selector);
}

function Markdown(textarea, div) {
    this.textarea = textarea;
    this.div = div;
}

Markdown.prototype = {
    init: function() {
        this.div.innerHTML = this.compile(this.textarea.value);
        this.textarea.oninput = () => {
            this.div.innerHTML = this.compile(this.textarea.value);
        }
    },
    compile: function(initStr) {
        var rows = initStr.split('\n');
        var matchArry;
        var html = '';
        for (var i = 0, len = rows.length; i < len; i++) {
            matchArry = rows[i].match(/^#\s/)
                     || rows[i].match(/^##\s/)
                     || rows[i].match(/^###\s/)
                     || rows[i].match(/^####\s/)
                     || rows[i].match(/^#####\s/)
                     || rows[i].match(/^######\s/)
                     || rows[i].match(/^\*{3,}/)
                     || rows[i].match(/^>\s/)
                     || rows[i].match(/^\*\s/)
                     || rows[i].match(/^\d\.\s/)
                     || rows[i].match(/^```$/)
                     || rows[i].match(/^\|.*\|/);

            if (matchArry) {
                switch(matchArry[0]) {
                    case '# ':
                        html += '<h1>' + this.format(rows[i].substring(2)) + '</h1>';
                        break;
                    case '## ':
                        html += '<h2>' + this.format(rows[i].substring(3)) + '</h2>';
                        break;
                    case '### ':
                        html += '<h3>' + this.format(rows[i].substring(4)) + '</h3>';
                        break;
                    case '#### ':
                        html += '<h4>' + this.format(rows[i].substring(5)) + '</h4>';
                        break;
                    case '##### ':
                        html += '<h5>' + this.format(rows[i].substring(6)) + '</h5>';
                        break;
                    case '###### ':
                        html += '<h6>' + this.format(rows[i].substring(7)) + '</h6>';
                        break;
                    case rows[i].match(/^\*{3,}/) && rows[i].match(/^\*{3,}/)[0]:
                        html += rows[i].replace(/^\*{3,}/g, '<hr>');
                        break;
                    case '> ':
                        var temp = '';
                        var re = /^>\s/;
                        while (i < len && rows[i].match(re)) {
                            temp += '<p>' + rows[i].substring(2, rows[i].length) + '</p>';
                            i++;
                        }
                        html += '<blockquote>' + temp + '</blockquote>';
                        break;
                    case '* ':
                        var temp = '';
                        var re = /^\*\s/;
                        while (i < len && rows[i].match(re)) {
                            temp += '<li>' + rows[i].substring(2, rows[i].length) + '</li>';
                            i++;
                        } 
                        html += '<ul>' + temp + '</ul>';
                        break;
                    case rows[i].match(/^\d\.\s/) && rows[i].match(/^\d\.\s/)[0]:
                        var temp = '';
                        var re = /^\d\.\s/;
                        while (i < len && rows[i].match(re)) {
                            temp += '<li>' + rows[i].substring(3, rows[i].length) + '</li>';
                            i++;
                        } 
                        html += '<ol>' + temp + '</ol>';
                        break;
                    case '```':
                        var temp = '';
                        var re = /^```$/;
                        i++;
                        while (i < len && !re.test(rows[i])) {
                            temp += rows[i] + '\n';
                            i++;
                        }
                        html += '<pre>' + temp + '</pre>';
                        break;
                    case rows[i].match(/^\|.*\|/) && rows[i].match(/^\|.*\|/)[0]:
                        var temp = '';
                        var re = /^\|.*\|/;
                        var thRe = /^\[th\]/;
                        var arry, j, jlen;
                        while (i < len && re.test(rows[i])) {
                            arry = rows[i].split('|');
                            temp += '<tr>';
                            for (j = 1, jlen = arry.length - 1; j < jlen; j++) {
                                if (thRe.test(arry[1])) {
                                    temp += '<th>' + arry[j] + '</th>';
                                } else {
                                    temp += '<td>' + arry[j] + '</td>';
                                }
                            }
                            temp += '</tr>';
                            temp = temp.replace('[th]', '');
                            i++;
                        }
                        html += '<table>' + temp + '</table>';
                        break;
                    default:
                        break;
                }
            } else {
                html += '<p>' + this.format(rows[i]) + '</p>';
            }

        }
        return html;
    },
    format: function(str) { 
        str = str.replace(/\s/g, '&nbsp;'); 

        var bold = str.match(/\*{2}[^*].*?\*{2}/g); // 惰性匹配
        if (bold) {
            for (var i = 0, len = bold.length; i < len; i++) {
                str = str.replace(bold[i], '<b>' + bold[i].substring(2, bold[i].length - 2) + '</b>');
            }
        }

        var italic = str.match(/\*[^*].*?\*/g);  
        if (italic) {
            for (i = 0, len = italic.length; i < len; i++) {
                str = str.replace(italic[i], '<i>' + italic[i].substring(1, italic[i].length - 1) + '</i>');
            }
        }

        var code = str.match(/`.+`/g);
        if (code) {
            for (i = 0, len = code.length; i < len; i++) {
                str = str.replace(code[i], '<code>' + code[i].substring(1, code[i].length - 1) + '</code>');
            }
        }

        var img = str.match(/!\[.*\]\(.*\)/g);
        var re1 = /\(.*\)/;
        var re2 = /\[.*\]/;
        if (img) {
            for (i = 0, len = img.length; i < len; i++) {
                var url = img[i].match(re1)[0];
                var title = img[i].match(re2)[0];
                str = str.replace(img[i], '<img src=' + url.substring(1, url.length - 1) + ' alt=' + title.substring(1, title.length -1) + '>');
            }
        }

        var a = str.match(/\[.*\]\(.*\)/g);
        if (a) {
            for (i = 0, len = a.length; i < len; i++) {
                var url = a[i].match(re1)[0];
                var title = a[i].match(re2)[0];
                str = str.replace(a[i], '<a href=' + url.substring(1, url.length - 1)  + '>' + title.substring(1, title.length -1) + '</a>');
            }
        }

        return str;
    }
}

new Markdown($('textarea'), $('#right_div')).init();

})();
