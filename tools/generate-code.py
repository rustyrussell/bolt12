#! /usr/bin/env python3
import pyln.proto.message
from pyln.proto.message.fundamental_types import FundamentalHexType, IntegerType
import argparse
import sys


def generate_towire_field(field, allfields, lang):
    """Generate towire for a field, given it may be a complex type"""
    if isinstance(field.fieldtype, pyln.proto.message.SizedArrayType):
        # FIXME: UTF-8 arrays are special: length we want is in bytes!
        # However, only fixed-length UTF-8 array is currency, which is ASCII
        if lang == 'js':
            print('    assert.equal(value["{fname}"].length == {fixedlen})'
                  .format(fname=field.name,
                          fixedlen=field.fieldtype.arraysize), file=ofile)
        elif lang == 'py':
            print('    assert len(value["{fname}"]) == {fixedlen}'
                  .format(fname=field.name,
                          fixedlen=field.fieldtype.arraysize), file=ofile)

    if isinstance(field.fieldtype, pyln.proto.message.array_types.ArrayType):
        # UTF-8 arrays are special
        if field.fieldtype.elemtype.name == 'utf8':
            if lang == 'js':
                print('    buf = Buffer.concat([buf, towire_array_utf8(value["{fname}"])]);\n'
                      .format(fname=field.name),
                      file=ofile)
            elif lang == 'py':
                print('    buf += towire_array_utf8(value["{fname}"])'
                      .format(fname=field.name), file=ofile)
        else:
            if lang == 'js':
                print('    for (let v of value["{fname}"]) {{\n'
                      '        buf = Buffer.concat([buf, towire_{ftype}(v)]);\n'
                      '    }}'
                      .format(fname=field.name,
                              ftype=field.fieldtype.elemtype.name), file=ofile)
            elif lang == 'py':
                print('    for v in value["{fname}"]:\n'
                      '        buf += towire_{ftype}(v)'
                      .format(fname=field.name,
                              ftype=field.fieldtype.elemtype.name), file=ofile)
    elif isinstance(field.fieldtype,
                    pyln.proto.message.array_types.LengthFieldType):
        # FIXME: Make sure that all fields which use this length are the same!
        # FIXME: length() is not correct if field is utf8!
        for f in allfields:
            if f.name == field.fieldtype.len_for[0].name:
                assert f.fieldtype.elemtype.name != 'utf8'

        if lang == 'js':
            print('    buf = Buffer.concat([buf, towire_{ftype}(value["{lenfield}"].length)]);\n'
                  .format(ftype=field.fieldtype.underlying_type.name,
                          lenfield=field.fieldtype.len_for[0].name), file=ofile)
        elif lang == 'py':
            print('    buf += towire_{ftype}(len(value["{lenfield}"]))'
                  .format(ftype=field.fieldtype.underlying_type.name,
                          lenfield=field.fieldtype.len_for[0].name), file=ofile)
    else:
        if lang == 'js':
            print('    buf = Buffer.concat([buf, towire_{ftype}(value["{fname}"])]);'
                  .format(fname=field.name,
                          ftype=field.fieldtype.name), file=ofile)
        elif lang == 'py':
            print('    buf += towire_{ftype}(value["{fname}"])'
                  .format(fname=field.name,
                          ftype=field.fieldtype.name), file=ofile)

    # We increment this once for each field we write, so at the end
    # we assert that this is the number of fields in the dictionary.
    if lang == 'js':
        print('    _n++;', file=ofile)
    elif lang == 'py':
        print('    _n += 1', file=ofile)
 

def generate_fromwire_field(field, allfields, lang):
    """Generate fromwire for a field, given it may be a complex type"""
    if isinstance(field.fieldtype, pyln.proto.message.SizedArrayType):
        is_array = True
        limitstr = 'i < {}'.format(field.fieldtype.arraysize)
        sizestr = '{}'.format(field.fieldtype.arraysize)
    elif isinstance(field.fieldtype, pyln.proto.message.DynamicArrayType):
        is_array = True
        limitstr = 'i < lenfield_{}'.format(field.fieldtype.lenfield.name)
        sizestr = 'lenfield_{}'.format(field.fieldtype.lenfield.name)
    elif isinstance(field.fieldtype, pyln.proto.message.EllipsisArrayType):
        is_array = True
        if lang == 'js':
            limitstr = 'i < buffer.length'
            sizestr = 'buffer.length'
        elif lang == 'py':
            limitstr = 'len(buffer) != 0'
            sizestr = 'len(buffer)'
    else:
        is_array = False

    if is_array:
        # UTF-8 arrays are special
        if field.fieldtype.elemtype.name == 'utf8':
            if lang == 'js':
                print('    retarr = fromwire_array_utf8(buffer, {size});\n'
                      '    value["{fname}"] = retarr[0];\n'
                      '    buffer = retarr[1]'
                      .format(fname=field.name, size=sizestr), file=ofile)
            elif lang == 'py':
                print('    value["{fname}"], buffer = fromwire_array_utf8(buffer, {size})'
                      .format(fname=field.name, size=sizestr), file=ofile)
        else:
            if lang == 'js':
                print('    v = [];\n'
                      '    for (let i = 0; {limit}; i++) {{\n'
                      '        retarr = fromwire_{ftype}(buffer);\n'
                      '        v.push(retarr[0]);\n'
                      '        buffer = retarr[1];\n'
                      '    }}\n'
                      '    value["{fname}"] = v;'
                      .format(fname=field.name,
                              ftype=field.fieldtype.elemtype.name,
                              limit=limitstr), file=ofile)
            elif lang == 'py':
                print('    v = []\n'
                      '    i = 0\n'
                      '    while {limit}:\n'
                      '        val, buffer = fromwire_{ftype}(buffer)\n'
                      '        v.append(val)\n'
                      '        i += 1\n'
                      '    value["{fname}"] = v'
                      .format(fname=field.name,
                              ftype=field.fieldtype.elemtype.name,
                              limit=limitstr), file=ofile)
    elif isinstance(field.fieldtype,
                    pyln.proto.message.array_types.LengthFieldType):
        # We don't store lengths in the returned values, we just
        # keep local vars so we can use them we we read the actual
        # field
        if lang == 'js':
            print('    retarr = fromwire_{ftype}(buffer);\n'
                  '    let lenfield_{fname} = retarr[0];\n'
                  '    buffer = retarr[1];'
                  .format(fname=field.name,
                          ftype=field.fieldtype.underlying_type.name),
                  file=ofile)
        elif lang == 'py':
            print('    lenfield_{fname} = fromwire_{ftype}(buffer)'
                  .format(fname=field.name,
                          ftype=field.fieldtype.underlying_type.name),
                  file=ofile)
    else:
        if lang == 'js':
            print('    retarr = fromwire_{ftype}(buffer);\n'
                  '    value["{fname}"] = retarr[0];'
                  '    buffer = retarr[1];'
                  .format(fname=field.name,
                          ftype=field.fieldtype.name), file=ofile)
        elif lang == 'py':
            print('    val, buffer = fromwire_{ftype}(buffer)\n'
                  '    value["{fname}"] = val'
                  .format(fname=field.name,
                          ftype=field.fieldtype.name),
                  file=ofile)


def generate_tlvtype(tlvtype: 'TlvMessageType', lang):
    # Generate the fromwire / towire routines
    for f in tlvtype.fields:
        # If there's only one value, we just collapse it
        if len(f.fields) == 1:
            singleton = f.fields[0]
        else:
            singleton = None

        if lang == 'js':
            print('function towire_{tlvname}_{fname}(value)\n'
                  '{{\n'
                  '    let _n = 0;\n'
                  '    let buf = Buffer.alloc(0);'
                  .format(tlvname=tlvtype.name, fname=f.name),
                  file=ofile)
        elif lang == 'py':
            print('\n\ndef towire_{tlvname}_{fname}(value):\n'
                  '    _n = 0\n'
                  '    buf = bytes()'
                  .format(tlvname=tlvtype.name, fname=f.name),
                  file=ofile)

        # Singletons are collapsed, expand as generated code expects
        if singleton:
            if lang == 'js':
                print('    value = {{"{fname}": value}}'
                      .format(fname=singleton.name), file=ofile)
            elif lang == 'py':
                print('    value = {{"{fname}": value}}'
                      .format(fname=singleton.name), file=ofile)

        for subf in f.fields:
            generate_towire_field(subf, f.fields, lang)
        if lang == 'js':
            print('    assert(Object.keys(value).length == _n);\n'
                  '    return buf;\n'
                  '}\n', file=ofile)
        elif lang == 'py':
            print('    # Ensures there are no extra keys!\n'
                  '    assert len(value) == _n\n'
                  '    return buf', file=ofile)

        if lang == 'js':
            print('function fromwire_{tlvname}_{fname}(buffer)\n'
                  '{{\n'
                  '    let _n = 0;\n'
                  '    let retarr;\n'
                  '    value = {{}};'
                  .format(tlvname=tlvtype.name, fname=f.name), file=ofile)
        elif lang == 'py':
            print('\n\ndef fromwire_{tlvname}_{fname}(buffer):\n'
                  '    value = {{}}'
                  .format(tlvname=tlvtype.name, fname=f.name), file=ofile)
        for subf in f.fields:
            generate_fromwire_field(subf, f.fields, lang)

        # Collapse singletons:
        if singleton:
            if lang == 'js':
                print('\n'
                      '    return value["{fname}"];\n'
                      '}}\n'.format(fname=singleton.name), file=ofile)
            elif lang == 'py':
                print('\n'
                      '    return value["{fname}"], buffer'
                      .format(fname=singleton.name),
                      file=ofile)
        else:
            if lang == 'js':
                print('\n'
                      '    return value;\n'
                      '}\n', file=ofile)
            elif lang == 'py':
                print('\n'
                      '    return value, buffer', file=ofile)

    # Now, generate table
    if lang == 'js':
        print('const tlv_{} = {{'.format(tlvtype.name), file=ofile)
    elif lang == 'py':
        print('\n\ntlv_{} = {{'.format(tlvtype.name), file=ofile)
    for f in tlvtype.fields:
        if lang == 'js':
            print('    {num}: ["{fname}", towire_{tlvname}_{fname}, fromwire_{tlvname}_{fname}],'
                  .format(num=f.number, tlvname=tlvtype.name, fname=f.name), file=ofile)
        elif lang == 'py':
            print('    {num}: ("{fname}", towire_{tlvname}_{fname}, fromwire_{tlvname}_{fname}),'
                  .format(num=f.number, tlvname=tlvtype.name, fname=f.name), file=ofile)
    print('}', file=ofile)


def generate_msgtype(name: str, lang):
    if lang == 'js':
        print('function towire_{tlvname}(value)\n'
              '{{\n'
              '    let _n = 0;\n'
              '    let buf = Buffer.alloc(0);'
              .format(tlvname=name.name), file=ofile)
    elif lang == 'py':
        print('\n\ndef towire_{tlvname}(value):\n'
              '    _n = 0\n'
              '    buf = bytes()'
              .format(tlvname=name.name), file=ofile)

    for f in name.fields:
        generate_towire_field(f, name.fields, lang)
    if lang == 'js':
        print('    assert(value.length == _n);\n'
              '    return buf;\n'
              '}\n', file=ofile)
        print('function fromwire_{tlvname}(buffer)\n'
              '{{\n'
               '    let _n = 0;\n'
               '    let retarr;\n'
               '    value = {{}};'
              .format(tlvname=name.name), file=ofile)
    elif lang == 'py':
        print('    assert len(value) == _n\n'
              '    return buf', file=ofile)
        print('\n\ndef fromwire_{tlvname}(buffer):\n'
               '    value = {{}}'
              .format(tlvname=name.name), file=ofile)
    for f in name.fields:
        generate_fromwire_field(f, name.fields, lang)
    if lang == 'js':
        print('\n'
              '    return [value, buffer];\n'
              '}\n', file=ofile)
    elif lang == 'py':
        print('\n'
              '    return value, buffer', file=ofile)


def generate_subtype(name: str, lang):
    if lang == 'js':
        print('function towire_{tlvname}(value)\n'
              '{{\n'
              '    let _n = 0;\n'
              '    let buf = Buffer.alloc(0);'
              .format(tlvname=name.name), file=ofile)
    elif lang == 'py':
        print('\n\ndef towire_{tlvname}(value):\n'
              '    _n = 0\n'
              '    buf = bytes()'
              .format(tlvname=name.name), file=ofile)
    for f in name.fields:
        generate_towire_field(f, name.fields, lang)
    if lang == 'js':
        print('    assert(value.length == _n);\n'
              '    return buf;\n'
              '}\n', file=ofile)
        print('function fromwire_{tlvname}(buffer)\n'
              '{{\n'
              '    let _n = 0;\n'
              '    let retarr;\n'
              '    value = {{}};'
              .format(tlvname=name.name), file=ofile)
    elif lang == 'py':
        print('    assert len(value) == _n\n'
              '    return buf', file=ofile)
        print('\n\ndef fromwire_{tlvname}(buffer):\n'
              '    value = {{}}'
              .format(tlvname=name.name), file=ofile)
    for f in name.fields:
        generate_fromwire_field(f, name.fields, lang)

    if lang == 'js':
        print('\n'
              '    return [value, buffer];\n'
              '}\n', file=ofile)
    elif lang == 'py':
        print('\n'
              '    return value, buffer', file=ofile)


parser = argparse.ArgumentParser(
    description='Generate routines to translate message to/from Lightning wire format'
    )
parser.add_argument('--output', '-o', help='Where to direct output')
parser.add_argument('--preamble', help='Prepend this file to the output')
parser.add_argument('--postamble', help='Append this file to the output')
parser.add_argument('--language', help='Create routines for this language', default='js')
parser.add_argument('--spec', help='Use these spec CSV files', action='append', default=['../specs/bolt4.csv', '../specs/bolt12.csv'])
parser.add_argument('types', nargs='*', help='Only extract these tags')

args = parser.parse_args()
if args.output is None:
    ofile = sys.stdout
else:
    ofile = open(args.output, "wt")

if args.preamble:
    with open(args.preamble, "r") as f:
        ofile.write(f.read())

# We need types from bolt 4.
csv_lines = []
for specfile in args.spec:
    with open(specfile, 'r') as f:
        csv_lines += f.read().split()

ns = pyln.proto.message.MessageNamespace()

# Old version of pyln.proto are missing modern fundamental types.
if not 'utf8' in ns.fundamentaltypes:
    ns.fundamentaltypes['utf8'] = IntegerType('utf8', 1, 'B')
if not 'point32' in ns.fundamentaltypes:
    ns.fundamentaltypes['point32'] = FundamentalHexType('point32', 32)
if not 'bip340sig' in ns.fundamentaltypes:
    ns.fundamentaltypes['bip340sig'] = FundamentalHexType('bip340sig', 32)

ns.load_csv(csv_lines)

# If they don't specify, generate all
if args.types == []:
    args.types = list(ns.tlvtypes.keys()) + list(ns.subtypes.keys()) + list(ns.messagetypes.keys())

for typename in args.types:
    tlvtype = ns.get_tlvtype(typename)
    if tlvtype:
        generate_tlvtype(tlvtype, args.language)
        continue

    msgtype = ns.get_msgtype(typename)
    if msgtype:
        generate_msgtype(msgtype, args.language)
        continue

    subtype = ns.get_subtype(typename)
    if subtype:
        generate_subtype(subtype, args.language)
        continue

    raise ValueError("Unknown type {}".format(typename))

if args.postamble:
    with open(args.postamble, "r") as f:
        ofile.write(f.read())

