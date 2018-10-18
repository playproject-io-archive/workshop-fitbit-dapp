#!/usr/bin/python

import sys
import ast
import requests
import os

# parse env args
arg = [os.environ['ARG0'], os.environ['ARG1']]

# parse 3rd arg into kwargs if available
if 'ARG2' in os.environ: kwargs = ast.literal_eval(os.environ['ARG2'])
else: kwargs = {}

# attempt the request
req = requests.request(arg[0], arg[1], **kwargs)

# print text result on single line
# print(json.loads(req.text))
print(req.text.replace('\n',''))
