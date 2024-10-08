from usefulfunctions import encode_base58_checksum, hash160
import hashlib
import hmac
from io import BytesIO


# some methods to do compuation on the Field elements
class FieldElement:

    # dev num
    # prime range
    # initialize the field element
    def __init__(self, num, prime):
        if num >= prime or num < 0:
            error = "Num {} not in field range 0 to {}".format(num, prime - 1)
            raise ValueError(error)
        self.num = num
        self.prime = prime

    def __repr__(self):
        return "FieldElement_{}({})".format(self.prime, self.num)

    def __eq__(self, other):
        if other is None:
            return False
        return self.num == other.num and self.prime == other.prime

    def __ne__(self, other):
        return not (self == other)

    def __add__(self, other):
        if self.prime != other.prime:
            raise TypeError("Cannot add two numbers in different Fields")
        num = (self.num + other.num) % self.prime
        return self.__class__(num, self.prime)

    def __sub__(self, other):
        if self.prime != other.prime:
            raise TypeError("Cannot subtract two numbers in different Fields")
        num = (self.num - other.num) % self.prime
        return self.__class__(num, self.prime)

    def __mul__(self, other):
        if self.prime != other.prime:
            raise TypeError("Cannot multiply two numbers in different Fields")
        num = (self.num * other.num) % self.prime
        return self.__class__(num, self.prime)

    def __pow__(self, exponent):
        n = exponent % (self.prime - 1)
        num = pow(self.num, n, self.prime)
        return self.__class__(num, self.prime)

    def __truediv__(self, other):
        if self.prime != other.prime:
            raise TypeError("Cannot divide two numbers in different Fields")
        num = (self.num * pow(other.num, self.prime - 2, self.prime)) % self.prime
        return self.__class__(num, self.prime)

    def __rmul__(self, coefficient):
        num = (self.num * coefficient) % self.prime
        return self.__class__(num=num, prime=self.prime)


# curve have a form  y2 = x3 + ax + b,
# where a and b are constants specific to the curve
# Point class is used to represent a point on the curve
class Point:

    def __init__(self, x, y, a, b):
        self.a = a
        self.b = b
        self.x = x
        self.y = y
        if self.x is None and self.y is None:
            return

        # actucally on the curve
        if self.y**2 != self.x**3 + a * x + b:
            raise ValueError("({}, {}) is not on the curve".format(x, y))

    def __eq__(self, other):
        return (
            self.x == other.x
            and self.y == other.y
            and self.a == other.a
            and self.b == other.b
        )

    def __ne__(self, other):
        return not (self == other)

    def __repr__(self):
        if self.x is None:
            return "Point(infinity)"
        elif isinstance(self.x, FieldElement):
            return "Point({},{})_{}_{} FieldElement({})".format(
                self.x.num, self.y.num, self.a.num, self.b.num, self.x.prime
            )
        else:
            return "Point({},{})_{}_{}".format(self.x, self.y, self.a, self.b)

    def __add__(self, other):
        if self.a != other.a or self.b != other.b:
            raise TypeError(
                "Points {}, {} are not on the same curve".format(self, other)
            )
        # info self point is in infinity
        if self.x is None:
            return other
        # info other point is in infinity
        if other.x is None:
            return self
        # vertical line
        # @return the point at infinity
        if self.x == other.x and self.y != other.y:
            return self.__class__(None, None, self.a, self.b)

        # dev cal the slope of the line , s
        # s = (y2 – y1)/(x2 – x1)
        # x3 =s2 –x1 –x2
        # y3 = s(x1 – x3) – y1

        if self.x != other.x:
            s = (other.y - self.y) / (other.x - self.x)
            x = s**2 - self.x - other.x
            y = s * (self.x - x) - self.y
            return self.__class__(x, y, self.a, self.b)

        # P1 = P2 and also the vertical line
        # return the point at infinity
        if self == other and self.y == 0 * self.x:
            return self.__class__(None, None, self.a, self.b)
        # P1 = P2 , tangent line
        # slope s = (3 * x1^2 + a) / (2 * y1)
        # x3 = s^2 – 2 * x1
        # y3 = s * (x1 – x3) – y1
        # return P3
        if self == other:
            s = (3 * self.x**2 + self.a) / (2 * self.y)
            x = s**2 - 2 * self.x
            y = s * (self.x - x) - self.y
            return self.__class__(x, y, self.a, self.b)

    def __rmul__(self, coefficient):
        coef = coefficient
        current = self
        result = self.__class__(None, None, self.a, self.b)
        while coef:
            if coef & 1:
                result += current
            current += current
            coef >>= 1
        return result


# upper are the general cure and their fundamentals methods
# specfic curve for bitcoin
# a = 0, b = 7, making the equation y2 = x3 + 7

A = 0
B = 7
P = 2**256 - 2**32 - 977
N = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141


# defined the field element for P = 2**256 - 2**32 - 977
class S256Field(FieldElement):

    def __init__(self, num, prime=None):
        super().__init__(num=num, prime=P)

    def __repr__(self):
        return "{:x}".format(self.num).zfill(64)

    def sqrt(self):
        return self ** ((P + 1) // 4)


# Public key cryptogrpahy operations
# P = eG, in which we can easily generate a P if we know e and G but cannot  but we cannot easily compute e when we know P and G
# e the provate key and Public key
# private key is a 256 number and Public key P is a point on the curve (x,y) where x, y is 256 bits number .


class S256Point(Point):

    def __init__(self, x, y, a=None, b=None):
        a, b = S256Field(A), S256Field(B)
        if type(x) == int:
            super().__init__(x=S256Field(x), y=S256Field(y), a=a, b=b)
        else:
            super().__init__(x=x, y=y, a=a, b=b)

    def __repr__(self):
        if self.x is None:
            return "S256Point(infinity)"
        else:
            return "S256Point({}, {})".format(self.x, self.y)

    def __rmul__(self, coefficient):
        coef = coefficient % N
        return super().__rmul__(coef)

    # Note that we use Fermat’s little theorem for 1/s, since n is prime.
    # u=z/s , v=r/s.
    def verify(self, z, sig):
        # little fermat theorem
        s_inv = pow(sig.s, N - 2, N)
        u = z * s_inv % N
        v = sig.r * s_inv % N
        total = u * G + v * self
        return total.x.num == sig.r

    # uncompressed SEC format for a given point P = (x,y) is generated:
    # - Start with the prefix byte, which is 0x04.
    # - Append the x coordinate in 32 bytes as a big-endian integer.
    # - Append the y coordinate in 32 bytes as a big-endian integer.

    # compressed SEC format for a given point P = (x,y) is generated:
    # -  02 if y is even and 03 if Y is odd  .
    # - Append the x coordinate in 32 bytes as a big-endian integer.
    def sec(self, compressed=True):
        if compressed:
            if self.y.num % 2 == 0:
                return b"\x02" + self.x.num.to_bytes(32, "big")
            else:
                return b"\x03" + self.x.num.to_bytes(32, "big")
        else:
            return (
                b"\x04"
                + self.x.num.to_bytes(32, "big")
                + self.y.num.to_bytes(32, "big")
            )

    def hash160(self, compressed=True):
        return hash160(self.sec(compressed))

    def address(self, compressed=True, testnet=False):
        """Returns the address string"""
        h160 = self.hash160(compressed)
        if testnet:
            prefix = b"\x6f"
        else:
            prefix = b"\x00"
        return encode_base58_checksum(prefix + h160)

    @classmethod
    def parse(self, sec_bin):
        """returns a Point object from a SEC binary (not hex)"""
        if sec_bin[0] == 4:
            x = int.from_bytes(sec_bin[1:33], "big")
            y = int.from_bytes(sec_bin[33:65], "big")
            return S256Point(x=x, y=y)
        is_even = sec_bin[0] == 2
        x = S256Field(int.from_bytes(sec_bin[1:], "big"))
        # right side of the equation y^2 = x^3 + 7
        alpha = x**3 + S256Field(B)
        # solve for left side
        beta = alpha.sqrt()
        if beta.num % 2 == 0:
            even_beta = beta
            odd_beta = S256Field(P - beta.num)
        else:
            even_beta = S256Field(P - beta.num)
            odd_beta = beta
        if is_even:
            return S256Point(x, even_beta)
        else:
            return S256Point(x, odd_beta)


G = S256Point(
    0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798,
    0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8,
)


# DER signature format is defined like this:
# 1. Start with the 0x30 byte.
# 2. Encode the length of the rest of the signature (usually 0x44 or 0x45) and append.
# 3. Append the marker byte, 0x02.
# 4. Encode r as a big-endian integer, but prepend it with the 0x00 byte if r’s first byte ≥ 0x80. Prepend the resulting length to r. Add this to the result.
# 5. Append the marker byte, 0x02.
# 6. Encode s as a big-endian integer, but prepend with the 0x00 byte if s’s first byte ≥ 0x80. Prepend the resulting length to s. Add this to the result.


class Signature:

    def __init__(self, r, s):
        self.r = r
        self.s = s

    def __repr__(self):
        return "Signature({:x},{:x})".format(self.r, self.s)

    def der(self):
        rbin = self.r.to_bytes(32, byteorder="big")
        rbin = rbin.lstrip(b"\x00")
        if rbin[0] & 0x80:
            rbin = b"\x00" + rbin
        result = bytes([2, len(rbin)]) + rbin
        sbin = self.s.to_bytes(32, byteorder="big")
        sbin = sbin.lstrip(b"\x00")
        if sbin[0] & 0x80:
            sbin = b"\x00" + sbin
        result += bytes([2, len(sbin)]) + sbin
        return bytes([0x30, len(result)]) + result

    @classmethod
    def parse(cls, signature_bin):
        s = BytesIO(signature_bin)
        compound = s.read(1)[0]
        if compound != 0x30:
            raise SyntaxError("Bad Signature")
        length = s.read(1)[0]
        if length + 2 != len(signature_bin):
            raise SyntaxError("Bad Signature Length")
        marker = s.read(1)[0]
        if marker != 0x02:
            raise SyntaxError("Bad Signature")
        rlength = s.read(1)[0]
        r = int.from_bytes(s.read(rlength), "big")
        marker = s.read(1)[0]
        if marker != 0x02:
            raise SyntaxError("Bad Signature")
        slength = s.read(1)[0]
        s = int.from_bytes(s.read(slength), "big")
        if len(signature_bin) != 6 + rlength + slength:
            raise SyntaxError("Signature too long")
        return cls(r, s)
