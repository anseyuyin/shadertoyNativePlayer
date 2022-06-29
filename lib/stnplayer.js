var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var STNativePlayer;
(function (STNativePlayer) {
    var STNPlayer = /** @class */ (function () {
        function STNPlayer(webgl2) {
            this.mMouseOriX = 0;
            this.mMouseOriY = 0;
            this.mMousePosX = 0;
            this.mMousePosY = 0;
            this.mMouseIsDown = false;
            this.mMouseSignalDown = false;
            this.webgl2 = webgl2;
            this.canvas = webgl2.canvas;
            this.refreshCanvasSize();
            //reg event
            this.canvas.onmousedown = this.onmousedown.bind(this);
            this.canvas.onmousemove = this.onmousemove.bind(this);
            this.canvas.onmouseup = this.onmouseup.bind(this);
        }
        STNPlayer.prototype.onmouseup = function (ev) {
            this.mMouseIsDown = false;
            // if (this.mIsPaused) this.mForceFrame = true;
        };
        STNPlayer.prototype.onmousemove = function (ev) {
            if (!this.mMouseIsDown)
                return;
            var canvas = this.canvas;
            var rect = canvas.getBoundingClientRect();
            this.mMousePosX = Math.floor((ev.clientX - rect.left) / (rect.right - rect.left) * canvas.width);
            this.mMousePosY = Math.floor(this.canvas.height - (ev.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height);
            // if (this.mIsPaused) this.mForceFrame = true;
        };
        STNPlayer.prototype.onmousedown = function (ev) {
            var canvas = this.webgl2.canvas;
            var rect = canvas.getBoundingClientRect();
            this.mMouseOriX = Math.floor((ev.clientX - rect.left) / (rect.right - rect.left) * canvas.width);
            this.mMouseOriY = Math.floor(canvas.height - (ev.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height);
            this.mMousePosX = this.mMouseOriX;
            this.mMousePosY = this.mMouseOriY;
            this.mMouseIsDown = true;
            this.mMouseSignalDown = true;
            // if (this.mIsPaused) this.mForceFrame = true;
        };
        /**
         * start to run.
         * @param sToyData a json data from shadertoy .
         */
        STNPlayer.prototype.run = function (data) {
            var _this = this;
            var gl = this.webgl2;
            if (!data) {
                data = {};
            }
            if (!data.Image) {
                data.Image = { code: "" };
            }
            if (!data.Image.code)
                data.Image.code = STNativePlayer.sToyTest;
            //拼接shader , 组装 glProgram
            var vs_code = STNativePlayer.baseVS;
            var fs_code = STNativePlayer.baseFS.replace(STNPlayer.INSERT_TAG, data.Image.code);
            //生成着色器,上传着色器代码
            var vs = gl.createShader(gl.VERTEX_SHADER);
            var fs = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(vs, vs_code);
            gl.shaderSource(fs, fs_code);
            //编译字符串程序代码成二进制对象,便于webgl使用
            gl.compileShader(vs);
            //检查shader编译报错
            this.ckShaderCompileS(vs, "VS");
            gl.compileShader(fs);
            this.ckShaderCompileS(fs, "FS");
            //生成 glProgram
            var program = gl.createProgram();
            gl.attachShader(program, vs);
            gl.attachShader(program, fs);
            gl.linkProgram(program);
            //检查link program
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                var info = gl.getProgramInfoLog(program);
                console.error("linkProgram error : " + info);
            }
            //gl 状态
            gl.hint(gl.FRAGMENT_SHADER_DERIVATIVE_HINT, gl.NICEST);
            //启用 program
            gl.useProgram(program);
            //准备顶点数据
            //什么只有一个三角形? 我们只需像素渲染覆盖全屏（一个大三角形足以），只需要使用 gl_FragCoord + iResolution 来算定位像素UV。
            //        0
            //      /   \
            //     /     \
            //   2 ------- 1
            //
            var quadMeshData = {
                poss: [0, 3, 2, -1, -2, -1]
            };
            //生成buffer,上传数据到GPU
            var fullMesh = {
                glPosBuffer: this.setGLData(new Float32Array(quadMeshData.poss)),
            };
            //attrib 更新
            //pos 
            var aPositionAddr = gl.getAttribLocation(program, "a_Position"); //先获取 Attrib 的 名为 "a_Position" 字段的地址
            gl.bindBuffer(gl.ARRAY_BUFFER, fullMesh.glPosBuffer); //指定当前被操作的 缓冲区对象
            //告诉显卡从当前绑定的缓冲区（bindBuffer()指定的缓冲区）中读取顶点数据 (怎么去读取数据)
            gl.vertexAttribPointer(aPositionAddr, 2, gl.FLOAT, false, 0, 0); //告诉GPU，"a_Position" 字段，如何从缓冲区中读取数据
            //激活启用
            gl.enableVertexAttribArray(aPositionAddr);
            //绘制函数
            var baseDraw = function () {
                //绘制请求
                gl.drawArrays(gl.TRIANGLES, 0, 3);
            };
            //循环渲染
            var time = Date.now();
            var frame = 0;
            var totalTimeSec = 0;
            var loop = function () {
                if (!_this.webgl2)
                    return; //isdispoed
                var nowTime = Date.now();
                var dt = (nowTime - time) * 0.001;
                totalTimeSec += dt;
                time = nowTime;
                //uniform 更新
                //shaderToy 内置uniform 上传
                var iResolutionAddr = gl.getUniformLocation(program, "iResolution");
                gl.uniform3f(iResolutionAddr, gl.canvas.width, gl.canvas.height, 1);
                var iTimeAddr = gl.getUniformLocation(program, "iTime");
                gl.uniform1f(iTimeAddr, totalTimeSec);
                var iTimeDeltaAddr = gl.getUniformLocation(program, "iTimeDelta");
                gl.uniform1f(iTimeDeltaAddr, dt);
                var iMouseAddr = gl.getUniformLocation(program, "iMouse");
                gl.uniform4f(iMouseAddr, _this.mMousePosX, _this.mMousePosY, _this.mMouseOriX, _this.mMouseOriY);
                var iFrameAddr = gl.getUniformLocation(program, "iFrame");
                gl.uniform1i(iFrameAddr, frame);
                //绘制
                baseDraw();
                //循环刷新
                requestAnimationFrame(loop); //注意:这里遇到一个坑，如果用setTimeout 作为循环泵，会有严重的卡顿情况
                frame++;
            };
            loop();
        };
        /**
         * refresh Canvas size
         */
        STNPlayer.prototype.refreshCanvasSize = function () {
            var gl = this.webgl2;
            var canvas = gl.canvas;
            canvas.width = canvas["clientWidth"];
            canvas.height = canvas["clientHeight"];
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.scissor(0, 0, gl.canvas.width, gl.canvas.height);
        };
        /**
         * dispose this object.
         */
        STNPlayer.prototype.dispose = function () {
            this.webgl2 = null;
            this.canvas = null;
        };
        //upload data of glbuffer
        STNPlayer.prototype.setGLData = function (data, target, usage) {
            if (target === void 0) { target = this.webgl2.ARRAY_BUFFER; }
            if (usage === void 0) { usage = this.webgl2.STATIC_DRAW; }
            var gl = this.webgl2;
            var glBuffer = gl.createBuffer();
            gl.bindBuffer(target, glBuffer);
            gl.bufferData(target, data, usage); //data set to webglBuffer
            return glBuffer;
        };
        ;
        //check in shader error of compileing
        STNPlayer.prototype.ckShaderCompileS = function (sh, info) {
            if (info === void 0) { info = ""; }
            var gl = this.webgl2;
            var s = gl.getShaderParameter(sh, gl.COMPILE_STATUS);
            if (s == false) {
                var log = gl.getShaderInfoLog(sh);
                console.error("compiles shader error : " + info + " \n " + log + " ");
            }
        };
        STNPlayer.INSERT_TAG = "//=#*INSERT_LOCATION*#=";
        return STNPlayer;
    }());
    STNativePlayer.STNPlayer = STNPlayer;
})(STNativePlayer || (STNativePlayer = {}));
var STNativePlayer;
(function (STNativePlayer) {
    /**
     * load tool
     */
    var Loader = /** @class */ (function () {
        function Loader() {
        }
        Loader.xhr = function (url, rType) {
            var _this = this;
            return new Promise(function (res, rej) {
                var xhreq = new XMLHttpRequest();
                var success = false;
                xhreq.responseType = rType;
                xhreq.open("GET", url);
                xhreq.send();
                //event reg
                xhreq.onreadystatechange = function () {
                    if (xhreq.readyState == 4) {
                        switch (xhreq.status) {
                            case 200:
                                success = true;
                                res(xhreq.response);
                                break;
                            case 404:
                                rej(new Error("got a 404: " + url));
                                break;
                            default:
                        }
                    }
                };
                xhreq.onloadend = function () {
                    if (success)
                        return;
                    if (!_this.enableRetry) {
                        rej(new Error("load fial: " + url));
                        return;
                    }
                    //加载失败 重试
                    console.log("加载失败 重试");
                };
                xhreq.onerror = function (ev) {
                    rej(new Error("load error : " + url));
                };
            });
        };
        /**
         * load of stoyconfig datas
         * @param stoyPath
         */
        Loader.prototype.loadSToy = function (stoyPath) {
            return __awaiter(this, void 0, void 0, function () {
                var stoyCfgUrl, stoyD, stoyObj, IUrl, ICodeUrl, ICode;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            stoyCfgUrl = stoyPath + "/stoyconfig.json";
                            stoyD = {};
                            return [4 /*yield*/, Loader.xhr(stoyCfgUrl, "json")];
                        case 1:
                            stoyObj = _a.sent();
                            IUrl = stoyObj.files.Image;
                            if (!IUrl) return [3 /*break*/, 3];
                            ICodeUrl = stoyPath + "/" + IUrl;
                            return [4 /*yield*/, Loader.xhr(ICodeUrl, "text")];
                        case 2:
                            ICode = _a.sent();
                            stoyD.Image = { code: ICode };
                            _a.label = 3;
                        case 3: return [2 /*return*/, stoyD];
                    }
                });
            });
        };
        Loader.enableRetry = false;
        return Loader;
    }());
    STNativePlayer.Loader = Loader;
})(STNativePlayer || (STNativePlayer = {}));
var STNativePlayer;
(function (STNativePlayer) {
    STNativePlayer.baseVS = "#version 300 es\n        #ifdef GL_ES\n            precision highp float;\n            precision highp int;\n            precision mediump sampler3D;\n        #endif\n        in vec2 a_Position; //\u9876\u70B9 \u4F4D\u7F6E \u662F\u6709\u9ED8\u8BA4\u503C\u7684 (0,0,0,1)\n        void main() {\n            gl_Position = vec4(a_Position.xy, 0.0 , 1.0);\n        }\n    ";
    STNativePlayer.baseFS = "#version 300 es\n        #ifdef GL_ES\n            precision highp float;\n            precision highp int;\n            precision mediump sampler3D;\n        #endif\n        #define HW_PERFORMANCE 1\n\n        out vec4 color;\n        //uniforms\n        uniform vec3      iResolution;\n        uniform float     iTime;\n        //uniform float     iChannelTime[4];\n        uniform vec4      iMouse;\n        //uniform vec4      iDate;\n        //uniform float     iSampleRate;\n        //uniform vec3      iChannelResolution[4];\n        uniform int       iFrame;\n        uniform float     iTimeDelta;\n\n        //=#*INSERT_LOCATION*#=\n\n        void main(){\n            //color = vec4(0.0 , 1.0 , 0.0 , 1.0);\n            vec4 col = vec4(0.0 , 0.0 , 0.0 , 1.0);\n            mainImage(col , gl_FragCoord.xy);\n            color = col;\n        }\n    ";
    STNativePlayer.sToyTest = "\n    void mainImage( out vec4 fragColor, in vec2 fragCoord )\n    {\n        // Normalized pixel coordinates (from 0 to 1)\n        vec2 uv = fragCoord/iResolution.xy;\n    \n        // Time varying pixel color\n        vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));\n    \n        // Output to screen\n        fragColor = vec4(col,1.0);\n    }\n    ";
})(STNativePlayer || (STNativePlayer = {}));
//# sourceMappingURL=stnplayer.js.map