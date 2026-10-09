import urllib.request
import re

html = urllib.request.urlopen('https://www.simdaa.com/').read().decode('utf-8')
logos = re.findall(r'src="([^"]*?png[^"]*?)"', html, re.I)
for logo in set(logos):
    print(logo)
