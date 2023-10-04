from pyedfread import edf

# inputFile = "./inputData/023_ibeat/023.EDF" # doesnt work: segmentation fault
inputFile = "./lib/pyedfread-master/SUB001.EDF" # works
# inputFile = "./inputData/edf_files/15_ibr.edf" # doesnt work: segmentation fault, same for all other files in dir

samples, events, messages = edf.pread(inputFile)

print(samples)