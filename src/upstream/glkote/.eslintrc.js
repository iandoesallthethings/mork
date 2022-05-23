module.exports = {
    "env": {
        "browser": true,
        "es2020": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "globals": {
        "$": "readonly",
        "jQuery": "readonly",
    },
    "parserOptions": {
        ecmaVersion: 12,
        "sourceType": "module"
    },
    root: true,
    "rules": {
        'no-constant-condition': ['off'],
        'no-use-before-define': ['warn', 'nofunc'],
    }
};
