"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const uuid_1 = require("uuid");
const inMemoryStore_1 = require("../store/inMemoryStore");
const router = express_1.default.Router();
router.post('/', (req, res) => {
    const id = (0, uuid_1.v4)();
    const now = new Date().toISOString();
    const prd = Object.assign(Object.assign({}, req.body), { id, createdAt: now, updatedAt: now });
    inMemoryStore_1.store.prd.set(id, prd);
    res.status(201).json(prd);
});
router.get('/:id', (req, res) => {
    const prd = inMemoryStore_1.store.prd.get(req.params.id);
    if (!prd)
        return res.status(404).json({ error: 'Not found' });
    res.json(prd);
});
exports.default = router;
