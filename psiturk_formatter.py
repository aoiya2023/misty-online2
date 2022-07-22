import csv

fname = 'questiondata.csv'
outfname = 'minimally_formatted_questiondata.csv'
header = set([])
optional = ['other_gender_text', 'other_education_text', 'other_nation_text']
exclude = ['agree_disagree1', 'agree_disagree2', 'agree_disagree3', 'agree_disagree4', 'agree_disagree5', 'race', 'race_text']

bigd = {}

with open(fname, 'r') as f:
    reader = csv.reader(f, delimiter=',')
    for row in reader:
        if (not (row[1] in exclude)):
            header.add(row[1])

header = sorted(header)

with open(fname, 'r') as f:
    reader = csv.reader(f, delimiter=',')
    for row in reader:
        if (row[1] in exclude):
            continue
        if len(row[0]) > 32:
            print(row[0])
        if row[0] not in bigd:
            bigd[row[0]] = ['']*len(header)
        bigd[row[0]][header.index(row[1])] = row[2]

with open(outfname, 'w', newline='') as outf:
    writer = csv.writer(outf, delimiter=',')
    # sort output by age
    writer.writerow(['id'] + header)
    for item in sorted(bigd.items(), key=lambda x: x[1][header.index('cwid')]):
        if ('test' in item[1][header.index('email')]):
            print('invalid email:  ' + item[1][header.index('email')])
            continue
        if (len(item[1][header.index('cwid')]) < 8):
            print('invalid cwid:  '+item[1][header.index('cwid')])
            continue
        if '' in item[1]:
            indices = [i for i, x in enumerate(item[1]) if x == '']
            for optq in optional:
                position = header.index(optq)
                if position in indices:
                    indices.remove(position)
            if len(indices) > 0:
                print('Incomplete row:  ', item[0])
                continue
        writer.writerow([item[0]]+item[1])
