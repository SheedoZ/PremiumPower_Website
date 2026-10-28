"""Deterministic translation of the shared HTML, without network or a browser."""
from html import escape
from html.parser import HTMLParser
import json, subprocess


def copy_tables(source):
    start=source.index('const T = {')
    end=source.index('// ── PDF config',start)
    code=source[start:end]+'\nprocess.stdout.write(JSON.stringify({T,FAQS}));'
    # Stream the script to avoid Windows' command-line limit; preserve Arabic
    # independently of the host's default text encoding.
    return json.loads(subprocess.run(
        ['node'], input=code, check=True, capture_output=True,
        text=True, encoding='utf-8',
    ).stdout)


def translate(source, table):
    class Translator(HTMLParser):
        def __init__(self):
            super().__init__(convert_charrefs=False)
            self.stack=[]; self.edits=[]
            self.offsets=[0]
            for line in source.splitlines(True): self.offsets.append(self.offsets[-1]+len(line))
        def absolute_position(self):
            line,col=self.getpos(); return self.offsets[line-1]+col
        def handle_starttag(self,tag,attrs):
            attrs=dict(attrs); start=self.absolute_position(); raw=self.get_starttag_text(); end=start+len(raw)
            outer=any(x[2] for x in self.stack)
            key=attrs.get('data-i18n'); value=table.get(key) if not outer else None
            if not outer:
                import re
                updated = raw
                for attribute in ('placeholder', 'aria-label', 'title'):
                    key = attrs.get('data-i18n-' + attribute)
                    if key in table:
                        text = escape(table[key], quote=True)
                        pattern = r'(?<![\w-])' + re.escape(attribute) + r'="[^"]*"'
                        if re.search(pattern, updated):
                            updated = re.sub(pattern, lambda _: f'{attribute}="{text}"', updated)
                        else:
                            updated = updated[:-1] + f' {attribute}="{text}">'
                if updated != raw:
                    self.edits.append((start, end, updated))
            if tag not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}:
                self.stack.append((tag,end,value,attrs.get('class','')))
        def handle_endtag(self,tag):
            for i in range(len(self.stack)-1,-1,-1):
                if self.stack[i][0]==tag:
                    _,start,value,classes=self.stack[i]; del self.stack[i:]
                    if value is not None:
                        if 'sec-title' in classes.split():
                            parts=value.split('\n'); value='<br>'.join(escape(x) if i==0 else '<span class="accent">'+escape(x)+'</span>' for i,x in enumerate(parts))
                        self.edits.append((start,self.absolute_position(),value))
                    break
    parser=Translator(); parser.feed(source)
    for start,end,value in sorted(parser.edits,reverse=True): source=source[:start]+value+source[end:]
    return source
