import './easeljs';

export const sourceTypeOptions = [
    {
        label: '固定电荷',
        value: 'E',
    },
    {
        label: '圆形磁场',
        value: 'M',
    },
];

export type SceneElement = {
    type: 'E';
    x: number;
    y: number;
    q: number;
} | {
    type: 'M';
    x: number;
    y: number;
    r: number;
    B: number;
}

export type ParticleProps = {
    x: number;
    y: number;
    v: number;
    angle: number;
    m: number;
    q: number;
}

const PIXELS_PER_METER = 100;

export function generateScene(elements: SceneElement[]) {
    const stage = new createjs.Stage('stage');
    stage.clear();
    for(let elm of elements) {
        if(elm.type == 'E') {
            let shape = new createjs.Shape();
            shape.graphics.beginFill(elm.q > 0 ? '#ff0000' : '#0000ff').drawCircle(0, 0, 2);
            shape.x = elm.x * PIXELS_PER_METER;
            shape.y = elm.y * PIXELS_PER_METER,
            stage.addChild(shape);
            let label = new createjs.Text(`q = ${elm.q.toExponential(3)}C`);
            label.color = '#000000';
            label.x = elm.x * PIXELS_PER_METER + 4;
            label.y = elm.y * PIXELS_PER_METER + 4;
            stage.addChild(label);
        } else if(elm.type == 'M') {
            let shape = new createjs.Shape();
            shape.graphics
                .beginFill(elm.B > 0 ? '#ff000040' : '#0000ff40')
                .beginStroke(elm.B > 0 ? '#ff0000' : '#0000ff')
                .drawCircle(0, 0, elm.r * PIXELS_PER_METER);
            shape.x = elm.x * PIXELS_PER_METER;
            shape.y = elm.y * PIXELS_PER_METER,
            stage.addChild(shape);
            let label = new createjs.Text(`B = ${elm.B.toExponential(3)}T`);
            label.color = '#000000';
            label.x = elm.x * PIXELS_PER_METER;
            label.y = elm.y * PIXELS_PER_METER;
            stage.addChild(label);
        }
    }
    stage.update();
    return stage;
}

type Vec2D = [number, number];

function vectorAdd(...args: Vec2D[]): Vec2D {
    let ret: Vec2D = [0, 0]
    args.forEach(v => { ret[0] += v[0]; ret[1] += v[1] });
    return ret;
}

function vectorSubtract(a: Vec2D, b: Vec2D): Vec2D {
    return [a[0] - b[0], a[1] - b[1]];
}

function vectorPowZero(a: Vec2D): Vec2D {
    let mod = Math.sqrt(a[0] * a[0] + a[1] * a[1]);
    return [a[0] / mod, a[1] / mod];
}

function vectorMultiple(k: number, a: Vec2D): Vec2D {
    return [k * a[0], k * a[1]];
}

function vectorDotMultiple(a: Vec2D, b: Vec2D): number {
    return a[0] * b[0] + a[1] * b[1];
}

function vectorCrossMultiple(a: Vec2D, b: number): Vec2D {
    return [-b * a[1], b * a[0]];
}

const DELTA_TIME = 1e-4;
const EPSILON_0 = 8.854187817e-12;
const K_E = 1 / (4 * Math.PI * EPSILON_0);

function calcForceE(q1: number, q2: number, r: Vec2D): Vec2D {
    return vectorMultiple(K_E * q1 * q2 / vectorDotMultiple(r, r), vectorPowZero(r));
}

function calcForceM(q: number, v: Vec2D, B: number): Vec2D {
    return vectorMultiple(q, vectorCrossMultiple(v, B));
}

export function calculate(elements: SceneElement[], particle: ParticleProps, duration: number) {
    let stage = generateScene(elements);
    let pos: Vec2D = [particle.x, particle.y];
    let v: Vec2D = [particle.v * Math.cos(particle.angle * Math.PI / 180), particle.v * Math.sin(particle.angle * Math.PI / 180)];
    let g = new createjs.Graphics;
    g.moveTo(pos[0] * PIXELS_PER_METER, pos[1] * PIXELS_PER_METER);
    g.beginStroke('#00ff00');
    for(let t = 0; t <= duration; t += DELTA_TIME) {
        let force = vectorAdd(...elements.map(elm => {
            if(elm.type == 'E') {
                let r = vectorSubtract(pos, [elm.x, elm.y])
                return calcForceE(particle.q, elm.q, r);
            } else if(elm.type == 'M') {
                let r = vectorSubtract(pos, [elm.x, elm.y]);
                if(vectorDotMultiple(r, r) > elm.r) return [0, 0];
                else return calcForceM(particle.q, v, elm.B);
            }
        }) as Vec2D[]);
        let acceleration = vectorMultiple(1 / particle.m, force);
        let nextV = vectorAdd(v, vectorMultiple(DELTA_TIME, acceleration));
        let avgV = vectorMultiple(0.5, vectorAdd(v, nextV));
        let nextPos = vectorAdd(pos, vectorMultiple(DELTA_TIME, avgV));
        pos = nextPos;
        v = nextV;
        g.lineTo(pos[0] * PIXELS_PER_METER, pos[1] * PIXELS_PER_METER);
    }
    let shape = new createjs.Shape(g);
    stage.addChild(shape);
    stage.update();
}