

# Given a rack row letter, provides the next row letter
# Essentially, after Z is AA and after AA is AB etc.
def next_char(char):
    if len(char) == 1:
        if char < "Z":
            return chr(ord(char) + 1)
        else:
            return "AA"
    else:
        if char[-1] < "Z":
            return char[:-1] + next_char(char[-1])
        else:
            return next_char(char[:-1]) + "A"


# Returns whether rack row1 is greater than rack row2.
# AA is greater than Z, etc. Otherwise, use lexographic comparison.
def greater_than(row1, row2):
    if len(row2) > len(row1):
        return False
    return row1 > row2


def generate_racks(r1, r2, c1, c2):
    r1 = r1.upper()
    r2 = r2.upper()
    if greater_than(r1, r2):
        temp = r1
        r1 = r2
        r2 = temp

    c1 = int(c1)
    c2 = int(c2)

    racks = []

    for c in range(min(c1, c2), max(c1, c2) + 1):
        r = r1
        while True:
            racks.append(r + str(c))
            r = next_char(r)
            if greater_than(r, r2):
                break

    return racks
