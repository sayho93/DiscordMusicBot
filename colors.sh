
# color
szColBk="[;30m";    szColBk1="[1;30m"    # black
szColRe="[;31m";    szColRe1="[1;31m"    # red
szColGr="[;32m";    szColGr1="[1;32m"    # green
szColYe="[;33m";    szColYe1="[1;33m"    # yellow
szColBl="[;34m";    szColBl1="[1;34m"    # blue
szColPu="[;35m";    szColPu1="[1;35m"    # magenta(purple)
szColCy="[;36m";    szColCy1="[1;36m"    # cyan
szColGy="[;37m";    szColWh="[1;37m"    # white
szNormal="[;m"
# command
sed \
    -e "s/\(error:\)/${szColRe1}\\1$szNormal/g" \
    -e "s/\(warn:\)/${szColRe1}\\1$szNormal/g" \
    -e "s/\(info:\)/${szColGr1}\\1$szNormal/g" \
    -e "s/\(http:\)/${szColYe1}\\1$szNormal/g" \
    -e "s/\(verbose:\)/${szColCy1}\\1$szNormal/g" \
    -e "s/\(debug:\)/${szColBl1}\\1$szNormal/g" \
    -e "s/\(silly:\)/${szColPu1}\\1$szNormal/g" \
