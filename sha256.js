class Hash {
    static sha256(ascii) {
        const maxWord = Math.pow(2, 32);
        let result = '';
        let words = [];
        const asciiBitLength = ascii.length * 8;

        //* caching results is optional - remove/add slash from front of this line to toggle
        // Initial hash value: first 32 bits of the fractional parts of the square roots of the first 8 primes
        // (we actually calculate the first 64, but extra values are just ignored)
        let hash = this.sha256.h = this.sha256.h || [];
        // let hash = [];
        // Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes
        let k = this.sha256.k = this.sha256.k || [];
        // let k = [];
        let primeCounter = k.length;
        // let primeCounter = 0;

        let isComposite = {};
        for (let candidate = 2; primeCounter < 64; candidate++) {
            if (!isComposite[candidate]) {
                for (let i = 0; i < 313; i += candidate) {
                    isComposite[i] = candidate;
                }
                hash[primeCounter] = (Math.pow(candidate, 0.5) * maxWord) | 0;
                k[primeCounter++] = (Math.pow(candidate, 1 / 3) * maxWord) | 0;
            }
        }

        ascii += '\x80'; // Append Ƈ' bit (plus zero padding)
        while (ascii.length % 64 - 56) {
            ascii += '\x00'; // More zero padding
        }

        for (let i = 0; i < ascii.length; i++) {
            const j = ascii.charCodeAt(i);
            if (j >> 8) {
                return; // ASCII check: only accept characters in range 0-255
            }
            words[i >> 2] |= j << ((3 - i) % 4) * 8;
        }
        words[words.length] = ((asciiBitLength / maxWord) | 0);
        words[words.length] = (asciiBitLength);

        // process each chunk
        for (let j = 0; j < words.length;) {
            const w = words.slice(j, j += 16); // The message is expanded into 64 words as part of the iteration
            const oldHash = hash;
            // This is now the undefinedworking hash", often labelled as variables a...g
            // (we have to truncate as well, otherwise extra entries at the end accumulate
            hash = hash.slice(0, 8);

            for (let i = 0; i < 64; i++) {
                // Expand the message into 64 words
                // Used below if 
                const w15 = w[i - 15];
                const w2 = w[i - 2];

                // Iterate
                const a = hash[0];
                const e = hash[4];
                const temp1 = hash[7]
                    + (this.#rightRotate(e, 6) ^ this.#rightRotate(e, 11) ^ this.#rightRotate(e, 25)) // S1
                    + ((e & hash[5]) ^ ((~e) & hash[6])) // ch
                    + k[i]
                    // Expand the message schedule if needed
                    + (w[i] = (i < 16) ? w[i] : (
                        w[i - 16]
                        + (this.#rightRotate(w15, 7) ^ this.#rightRotate(w15, 18) ^ (w15 >>> 3)) // s0
                        + w[i - 7]
                        + (this.#rightRotate(w2, 17) ^ this.#rightRotate(w2, 19) ^ (w2 >>> 10)) // s1
                    ) | 0
                    );
                // This is only used once, so *could* be moved below, but it only saves 4 bytes and makes things unreadble
                const temp2 = (this.#rightRotate(a, 2) ^ this.#rightRotate(a, 13) ^ this.#rightRotate(a, 22)) // S0
                    + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2])); // maj

                hash = [(temp1 + temp2) | 0].concat(hash); // We don't bother trimming off the extra ones, they're harmless as long as we're truncating when we do the slice()
                hash[4] = (hash[4] + temp1) | 0;
            }

            for (let i = 0; i < 8; i++) {
                hash[i] = (hash[i] + oldHash[i]) | 0;
            }
        }

        for (let i = 0; i < 8; i++) {
            for (let j = 3; j + 1; j--) {
                const b = (hash[i] >> (j * 8)) & 255;
                result += ((b < 16) ? 0 : '') + b.toString(16);
            }
        }
        return result;
    }

    static #rightRotate(value, amount) {
        return (value >>> amount) | (value << (32 - amount));
    }
}


let hash0 = Hash.sha256('abc');
console.log(hash0 === 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
let hash1 = Hash.sha256('ABCDEF');
console.log(hash1);
let hash2 = Hash.sha256('ABCDEFG');
console.log(hash2);
let empty = Hash.sha256('');
console.log(empty === 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
