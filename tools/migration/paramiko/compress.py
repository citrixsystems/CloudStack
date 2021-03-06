# Copyright (C) 2003-2007  Robey Pointer <robeypointer@gmail.com>
# Copyright 2012 Citrix Systems, Inc. Licensed under the
# Apache License, Version 2.0 (the "License"); you may not use this
# file except in compliance with the License.  Citrix Systems, Inc.
# reserves all rights not expressly granted by the License.
# You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# 
# Automatically generated by addcopyright.py at 04/03/2012
# 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA.

"""
Compression implementations for a Transport.
"""

import zlib


class ZlibCompressor (object):
    def __init__(self):
        self.z = zlib.compressobj(9)

    def __call__(self, data):
        return self.z.compress(data) + self.z.flush(zlib.Z_FULL_FLUSH)


class ZlibDecompressor (object):
    def __init__(self):
        self.z = zlib.decompressobj()

    def __call__(self, data):
        return self.z.decompress(data)
