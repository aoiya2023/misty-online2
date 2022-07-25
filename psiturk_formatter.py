"""
psiturk_formatter.py
- Use to format questiondata.csv in a more readable csv.
"""
import csv

fname = 'questiondata.csv'
outfname = 'minimally_formatted_questiondata.csv'
# header for the csv
header = set([])
optional = ['other_gender_text']
# data to exclude from output
exclude = []

# dictionary to put data before writing out to a file
bigd = {}

# create header (e.g. id. age, etc.)
with open(fname, 'r') as f:
    # returns a reader object which will iterate over lines in the given csvfile
    reader = csv.reader(f, delimiter=',')
    for row in reader:
        if (not (row[1] in exclude)):
            header.add(row[1])

# sort in alphabetical order
header = sorted(header)

# read the data and put it in bigd (dictionary)
with open(fname, 'r') as f:
    reader = csv.reader(f, delimiter=',')
    for row in reader:
        if (row[1] in exclude):
            continue
        # I'm not too sure what this does, but it checks the id column
        if len(row[0]) > 32:
            print(row[0])
        
        if row[0] not in bigd:
            # key = id; value = list with col for each header
            bigd[row[0]] = ['']*len(header)
        # fill in the list
        bigd[row[0]][header.index(row[1])] = row[2]

# write the bigd data to output file
with open(outfname, 'w', newline='') as outf:
    writer = csv.writer(outf, delimiter=',')
    # write the header
    writer.writerow(['id'] + header)
    # sort output by age
    for item in sorted(bigd.items(), key=lambda x: x[1][header.index('age')]):
        if '' in item[1]:
            # get the indices of empty cols
            indices = [i for i, x in enumerate(item[1]) if x == '']
            # ignore if the empty col is one of the optional
            for optq in optional:
                position = header.index(optq)
                if position in indices:
                    indices.remove(position)
            # there's still empty col = incomplete task
            if len(indices) > 0:
                print('Incomplete row:  ', item[0])
                continue
        writer.writerow([item[0]]+item[1])
