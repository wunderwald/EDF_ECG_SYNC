# -*- coding: utf-8 -*-
"""
Setup file for pyedf. Builds cython extension needed for using
the C EDF access API.

To build locally call
    python setup.py build_ext --inplace

"""

import sys
from distutils.core import setup
from distutils.extension import Extension
from Cython.Distutils import build_ext
from Cython.Build import cythonize
import numpy


if sys.platform.startswith('darwin'):
    args = {'include_dirs': [numpy.get_include(), '/Library/Frameworks/edfapi.framework/Headers'],
            'extra_link_args': ['-F/Library/Frameworks/', '-framework', 'edfapi'],
            'extra_compile_args': ["-w"]}
elif sys.platform.startswith('win32'):
    import os
    import platform
    srr_basedir = r"C:\Program Files (x86)\SR Research\EyeLink\EDF_Access_API"
    if platform.architecture()[0] == "64bit":
        arch_dir = 'win64'
        lib_names = ['edfapi64']
    else:
        arch_dir = 'win32'
        lib_names = ['edfapi']
    args = {'include_dirs': [numpy.get_include(), os.path.join(srr_basedir, 'Example')],
            'library_dirs': [os.path.join(srr_basedir, 'lib', arch_dir)],
            'libraries': lib_names
            }
else:  # linux, unix, cygwin
    args = {'include_dirs': [numpy.get_include(), 'include/'],
            'library_dirs': ['lib/'],
            'libraries': ['edfapi'],
            'extra_compile_args': ['-fopenmp'],
            'extra_link_args': ['-fopenmp']}

ext_module = Extension(
    "pyedfread.edfread",
    ['pyedfread/edfread.pyx'],
    **args
)

ext_data = Extension(
    "pyedfread.edf_data",
    ['pyedfread/edf_data.pyx'],
    **args
)

setup(name='pyedfread',
      version='0.1',
      description='Read SR-Research EDF files with python.',
      author='Niklas Wilming',
      cmdclass={'build_ext': build_ext},
      packages=['pyedfread'],
      ext_modules=[ext_data, ext_module],
      scripts=['pyedfread/read_edf']
      )
