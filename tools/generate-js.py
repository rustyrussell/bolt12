#! /usr/bin/python3
import pyln.proto.message
import argparse


def field_index(allfields, name):
    """Since we use JavaScript arrays, but pyln.proto.msg uses names"""
    for i, f in enumerate(allfields):
        if f.name == name:
            return i
    raise ValueError("Unknown field {}".format(name))


def generate_towire_field(field, allfields):
    """Generate towire for a field, given it may be a complex type"""
    if isinstance(field.fieldtype, pyln.proto.message.SizedArrayType):
        print('    assert.equal(value[_n].length == {fixedlen}'
              .format(fixedlen=subf.fieldtype.arraysize))

    # FIXME: pyln.proto.message should expose ArrayType, which is the
    # common parent!
    if (isinstance(field.fieldtype, pyln.proto.message.EllipsisArrayType)
        or isinstance(field.fieldtype, pyln.proto.message.SizedArrayType)
        or isinstance(field.fieldtype, pyln.proto.message.DynamicArrayType)):
        print('    for (let v in value[_n]) {{\n'
              '        buf = Buffer.concat([buf, towire_{ftype}(v)]);\n'
              '    }}'
              .format(ftype=field.fieldtype.elemtype.name))
    # FIXME: pyln.proto.message should expose LengthFieldType
    elif hasattr(field.fieldtype, 'len_for'):
        # We don't have a value for this, we intuit it from the things its
        # a length for!
        # FIXME: Make sure that all fields which use this length are the same!
        findex = field_index(allfields, field.fieldtype.len_for[0].name)
        print('    buf = Buffer.concat([buf, towire_{ftype}(value[{findex}].length)]);'
              .format(ftype=field.fieldtype.underlying_type.name,
                      findex=findex))
    else:
        print('    buf = Buffer.concat([buf, towire_{ftype}(value[_n++])]);'
              .format(ftype=field.fieldtype.name))


def generate_fromwire_field(field, allfields):
    """Generate fromwire for a field, given it may be a complex type"""
    if isinstance(field.fieldtype, pyln.proto.message.SizedArrayType):
        is_array = True
        limitstr = 'i < {}'.format(subf.fieldtype.arraysize)
    elif isinstance(field.fieldtype, pyln.proto.message.DynamicArrayType):
        is_array = True
        limitstr = 'i < lenfield_{}'.format(subf.fieldtype.lenfield.name)
    elif isinstance(field.fieldtype, pyln.proto.message.EllipsisArrayType):
        is_array = True
        limitstr = 'buffer.length != 0'
    else:
        is_array = False

    if is_array:
        print('    v = [];\n'
              '    for (let i = 0; {limit}; i++) {{\n'
              '        v.push(fromwire_{ftype}(buffer));\n'
              '    }}\n'
              '    value.push(v);'
              .format(ftype=field.fieldtype.elemtype.name,
                      limit=limitstr))
    # FIXME: pyln.proto.message should expose LengthFieldType
    elif hasattr(field.fieldtype, 'len_for'):
        # We don't store lengths in the returned values, we just
        # keep local vars so we can use them we we read the actual
        # field
        print('    let lenfield_{fname} = fromwire_{ftype}(buffer);'
              .format(fname=field.name,
                      ftype=field.fieldtype.underlying_type.name))
    else:
        print('    value.push(fromwire_{ftype}(buffer));'
              .format(ftype=field.fieldtype.name))


def generate_tlvtype(tlvtype: 'TlvMessageType'):
    # Generate the fromwire / towire routines
    for f in tlvtype.fields:
        print('function towire_{tlvname}_{fname}(value)\n'
              '{{'
              .format(tlvname=tlvtype.name, fname=f.name))
        print('    let _n = 0;\n'
              '    let buf = Buffer;')
        for subf in f.fields:
            generate_towire_field(subf, f.fields)
        print('    assert(value.length() == _n);\n'
              '    return buf;\n'
              '}\n')

        print('function fromwire_{tlvname}_{fname}(buffer)\n'
              '{{'
              .format(tlvname=tlvtype.name, fname=f.name))
        print('    _n = 0;\n'
              '    value = [];')
        for subf in f.fields:
            generate_fromwire_field(subf, f.fields)
        print('    return value;\n'
              '}\n')

    # Now, generate table
    print('const tlv_{} = {{'.format(tlvtype.name))
    for f in tlvtype.fields:
        print('    {num}: [ "{fname}", towire_{tlvname}_{fname}, fromwire_{tlvname}_{fname} ],'
              .format(num=f.number, tlvname=tlvtype.name, fname=f.name))
    print('}')


def generate_msgtype(name: str):
    raise RuntimeError("FIXME: Implement!")


def generate_subtype(name: str):
    raise RuntimeError("FIXME: Implement!")

# We need types from bolt 4.
csv_lines = []
for boltnum in (4, 12):
    with open('specs/bolt{}.csv'.format(boltnum), 'r') as f:
        csv_lines += f.read().split()

ns = pyln.proto.message.MessageNamespace()

# Old version of pyln.proto are missing modern fundamental types.
if not 'utf8' in ns.fundamentaltypes:
    ns.fundamentaltypes['utf8'] = ns.fundamentaltypes['byte']
if not 'pubkey32' in ns.fundamentaltypes:
    ns.fundamentaltypes['pubkey32'] = ns.fundamentaltypes['sha256']
if not 'bip340sig' in ns.fundamentaltypes:
    ns.fundamentaltypes['bip340sig'] = ns.fundamentaltypes['signature']

ns.load_csv(csv_lines)

parser = argparse.ArgumentParser(
    description='Generate JavaScript routines to translate message to/from Lightning wire format'
    )
parser.add_argument('types', nargs='*', help='Only extract these tags')

args = parser.parse_args()

# If they don't specify, generate all
if args.types == []:
    args.types = list(ns.tlvtypes.keys()) + list(ns.subtypes.keys()) + list(ns.messagetypes.keys())

for typename in args.types:
    tlvtype = ns.get_tlvtype(typename)
    if tlvtype:
        generate_tlvtype(tlvtype)
        continue

    msgtype = ns.get_msgtype(typename)
    if msgtype:
        generate_msgtype(msgtype)
        continue

    subtype = ns.get_subtype(typename)
    if subtype:
        generate_subtype(subtype)
        continue

    raise ValueError("Unknown type {}".format(typename))
    
        