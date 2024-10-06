from usefulfunctions import int_to_little_endian, hash256, little_endian_to_int


class Block:

    def __init__(
        self, version, prev_block, merkle_root, timestamp, bits, nonce, tx_hashes=None
    ):
        self.version = version
        self.prev_block = prev_block
        self.merkle_root = merkle_root
        self.timestamp = timestamp
        self.bits = bits
        self.nonce = nonce
        self.tx_hashes = tx_hashes

    @classmethod
    def parse(cls, s):
        version = little_endian_to_int(s.read(4))
        prev_block = s.read(32)[::-1]
        merkle_root = s.read(32)[::-1]
        timestamp = little_endian_to_int(s.read(4))
        bits = s.read(4)
        nonce = s.read(4)
        return cls(version, prev_block, merkle_root, timestamp, bits, nonce)

    def serialize(self):
        result = int_to_little_endian(self.version, 4)
        result += self.prev_block[::-1]
        result += self.merkle_root[::-1]
        result += int_to_little_endian(self.timestamp, 4)
        result += self.bits[::-1]
        result += self.nonce[::-1]
        return result

    def hash(self):
        s = self.serialize()
        h256 = hash256(s)
        return h256[::-1]
