#! /usr/bin/python3
import pyln.proto.message
from pyln.proto.message.fundamental_types import FundamentalHexType, IntegerType
import argparse
import sys


def field_index(allfields, name):
    """Since we use JavaScript arrays, but pyln.proto.msg uses names"""
    for i, f in enumerate(allfields):
        if f.name == name:
            return i
    raise ValueError("Unknown field {}".format(name))


def generate_towire_field(field, allfields, lang):
    """Generate towire for a field, given it may be a complex type"""
    if isinstance(field.fieldtype, pyln.proto.message.SizedArrayType):
        if lang == 'js':
            print('    assert.equal(value[_n].length == {fixedlen})'
                  .format(fixedlen=field.fieldtype.arraysize), file=ofile)
        elif lang == 'py':
            print('    assert len(value["{fname}"]) == {fixedlen}'
                  .format(fname=field.name,
                          fixedlen=field.fieldtype.arraysize), file=ofile)

    if isinstance(field.fieldtype, pyln.proto.message.array_types.ArrayType):
        if lang == 'js':
            print('    for (let v in value[_n]) {{\n'
                  '        buf = Buffer.concat([buf, towire_{ftype}(v)]);\n'
                  '    }}'
                  .format(ftype=field.fieldtype.elemtype.name), file=ofile)
        elif lang == 'py':
            print('    for v in value["{fname}"]:\n'
                  '        buf += towire_{ftype}(v);'
                  .format(fname=field.name,
                          ftype=field.fieldtype.elemtype.name), file=ofile)
    elif isinstance(field.fieldtype,
                    pyln.proto.message.array_types.LengthFieldType):
        # We don't have a value for this, we intuit it from the things its
        # a length for!
        # FIXME: Make sure that all fields which use this length are the same!
        findex = field_index(allfields, field.fieldtype.len_for[0].name)
        if lang == 'js':
            print('    buf = Buffer.concat([buf, towire_{ftype}(value[{findex}].length)]);\n'
                  .format(ftype=field.fieldtype.underlying_type.name,
                          findex=findex), file=ofile)
        elif lang == 'py':
            print('    buf += towire_{ftype}(value[{lenfield}].length)'
                  .format(ftype=field.fieldtype.underlying_type.name,
                          lenfield=field.fieldtype.len_for[0].name), file=ofile)
    else:
        if lang == 'js':
            print('    buf = Buffer.concat([buf, towire_{ftype}(value[_n])]);'
                  .format(ftype=field.fieldtype.name), file=ofile)
        elif lang == 'py':
            print('    buf += towire_{ftype}(value["{fname}"])'
                  .format(fname=field.name,
                          ftype=field.fieldtype.name), file=ofile)
    if lang == 'js':
        print('    _n++;', file=ofile)
    elif lang == 'py':
        print('    _n += 1', file=ofile)


def generate_fromwire_field(field, allfields, lang):
    """Generate fromwire for a field, given it may be a complex type"""
    if isinstance(field.fieldtype, pyln.proto.message.SizedArrayType):
        is_array = True
        limitstr = 'i < {}'.format(field.fieldtype.arraysize)
    elif isinstance(field.fieldtype, pyln.proto.message.DynamicArrayType):
        is_array = True
        limitstr = 'i < lenfield_{}'.format(field.fieldtype.lenfield.name)
    elif isinstance(field.fieldtype, pyln.proto.message.EllipsisArrayType):
        is_array = True
        if lang == 'js':
            limitstr = 'buffer.length != 0'
        elif lang == 'py':
            limitstr = 'len(buffer) != 0'
    else:
        is_array = False

    if is_array:
        if lang == 'js':
            print('    v = [];\n'
                  '    for (let i = 0; {limit}; i++) {{\n'
                  '        v.push(fromwire_{ftype}(buffer));\n'
                  '    }}\n'
                  '    value.push(v);'
              .format(ftype=field.fieldtype.elemtype.name,
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
            print('    let lenfield_{fname} = fromwire_{ftype}(buffer);'
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
            print('    value.push(fromwire_{ftype}(buffer));'
                  .format(ftype=field.fieldtype.name), file=ofile)
        elif lang == 'py':
            print('    val, buffer = fromwire_{ftype}(buffer)\n'
                  '    value["{fname}"] = val'
                  .format(fname=field.name,
                          ftype=field.fieldtype.name),
                  file=ofile)


def generate_tlvtype(tlvtype: 'TlvMessageType', lang):
    # Generate the fromwire / towire routines
    for f in tlvtype.fields:
        if lang == 'js':
            print('function towire_{tlvname}_{fname}(value)\n'
                  '{{\n'
                  '    let _n = 0;\n'
                  '    let buf = Buffer.alloc(0);'
                  .format(tlvname=tlvtype.name, fname=f.name),
                  file=ofile)
        elif lang == 'py':
            print('def towire_{tlvname}_{fname}(value):\n'
                  '    _n = 0\n'
                  '    buf = bytes()'
                  .format(tlvname=tlvtype.name, fname=f.name),
                  file=ofile)

        for subf in f.fields:
            generate_towire_field(subf, f.fields, lang)
        if lang == 'js':
            print('    assert(value.length == _n);\n'
                  '    return buf;\n'
                  '}\n', file=ofile)
        elif lang == 'py':
            print('    # Ensures there are no extra keys!\n'
                  '    assert len(value) == _n\n'
                  '    return buf\n', file=ofile)

        if lang == 'js':
            print('function fromwire_{tlvname}_{fname}(buffer)\n'
                  '{{\n'
                  '    _n = 0;\n'
                  '    value = [];'
                  .format(tlvname=tlvtype.name, fname=f.name), file=ofile)
        elif lang == 'py':
            print('def fromwire_{tlvname}_{fname}(buffer):\n'
                  '    value = {{}}'
                  .format(tlvname=tlvtype.name, fname=f.name), file=ofile)
        for subf in f.fields:
            generate_fromwire_field(subf, f.fields, lang)
        if lang == 'js':
            print('\n'
                  '    return value;\n'
                  '}\n', file=ofile)
        elif lang == 'py':
            print('\n'
                  '    return value, buffer\n', file=ofile)

    # Now, generate table
    if lang == 'js':
        print('const tlv_{} = {{'.format(tlvtype.name), file=ofile)
    elif lang == 'py':
        print('tlv_{} = {{'.format(tlvtype.name), file=ofile)
    for f in tlvtype.fields:
        print('    {num}: [ "{fname}", towire_{tlvname}_{fname}, fromwire_{tlvname}_{fname} ],'
              .format(num=f.number, tlvname=tlvtype.name, fname=f.name), file=ofile)
    print('}\n', file=ofile)


def generate_msgtype(name: str, lang):
    if lang == 'js':
        print('function towire_{tlvname}(value)\n'
              '{{\n'
              '    let _n = 0;\n'
              '    let buf = Buffer.alloc(0);'
              .format(tlvname=name.name), file=ofile)
    elif lang == 'py':
        print('def towire_{tlvname}(value):\n'
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
               '    _n = 0;\n'
               '    value = [];'
              .format(tlvname=name.name), file=ofile)
    elif lang == 'py':
        print('    assert len(value) == _n\n'
              '    return buf\n', file=ofile)
        print('def fromwire_{tlvname}(buffer):\n'
               '    value = {{}}'
              .format(tlvname=name.name), file=ofile)
    for f in name.fields:
        generate_fromwire_field(f, name.fields, lang)
    if lang == 'js':
        print('\n'
              '    return value;\n'
              '}\n', file=ofile)
    elif lang == 'py':
        print('\n'
              '    return value, buffer\n', file=ofile)


def generate_subtype(name: str, lang):
    if lang == 'js':
        print('function towire_{tlvname}(value)\n'
              '{{\n'
              '    let _n = 0;\n'
              '    let buf = Buffer.alloc(0);'
              .format(tlvname=name.name), file=ofile)
    elif lang == 'py':
        print('def towire_{tlvname}(value):\n'
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
              '    _n = 0;\n'
              '    value = [];'
              .format(tlvname=name.name), file=ofile)
    elif lang == 'py':
        print('    assert len(value) == _n\n'
              '    return buf\n', file=ofile)
        print('def fromwire_{tlvname}(buffer):\n'
              '    value = {{}}'
              .format(tlvname=name.name), file=ofile)
    for f in name.fields:
        generate_fromwire_field(f, name.fields, lang)

    if lang == 'js':
        print('\n'
              '    return value;\n'
              '}\n', file=ofile)
    elif lang == 'py':
        print('\n'
              '    return value, buffer\n', file=ofile)


# We need types from bolt 4.
csv_lines = []
for boltnum in (4, 12):
    with open('specs/bolt{}.csv'.format(boltnum), 'r') as f:
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

parser = argparse.ArgumentParser(
    description='Generate routines to translate message to/from Lightning wire format'
    )
parser.add_argument('--output', '-o', help='Where to direct output')
parser.add_argument('--language', help='Create routines for this language', default='js')
parser.add_argument('types', nargs='*', help='Only extract these tags')

args = parser.parse_args()
if args.output is None:
    ofile = sys.stdout
else:
    ofile = open(args.output, "wt")

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
