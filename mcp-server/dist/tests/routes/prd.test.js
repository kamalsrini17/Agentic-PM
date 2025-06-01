"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const prd_1 = __importDefault(require("../../src/routes/prd"));
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use('/prd', prd_1.default);
describe('PRD Resource API', () => {
    it('should create and retrieve a PRD', () => __awaiter(void 0, void 0, void 0, function* () {
        const sample = {
            title: 'Test PRD',
            version: '1.0',
            metadata: {
                owner: 'pm@example.com',
                status: 'draft',
                tags: ['alpha']
            },
            content: {
                overview: '...',
                problem_statement: '...',
                goals: ['...'],
                requirements: ['...'],
                success_metrics: ['...']
            }
        };
        const createRes = yield (0, supertest_1.default)(app).post('/prd').send(sample);
        expect(createRes.status).toBe(201);
        expect(createRes.body.id).toBeDefined();
        const getRes = yield (0, supertest_1.default)(app).get(`/prd/${createRes.body.id}`);
        expect(getRes.status).toBe(200);
        expect(getRes.body.title).toBe('Test PRD');
    }));
});
