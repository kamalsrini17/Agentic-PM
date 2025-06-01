"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const prd_1 = __importDefault(require("./routes/prd"));
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use('/prd', prd_1.default);
const PORT = 3000;
app.listen(PORT, () => console.log(`MCP server running on port ${PORT}`));
