namespace STNativePlayer {
    export type SToyUint = { code: string, ich0?, ich1?, ich2?, ich3?};
    export type SToyData = { Image: SToyUint, Common?: string, CubeA?: SToyUint, BufferA?: SToyUint, BufferB?: SToyUint, BufferC?: SToyUint, BufferD?: SToyUint };

    export class STNPlayer {
        private static readonly INSERT_TAG = `//=#*INSERT_LOCATION*#=`;
        private webgl2: WebGL2RenderingContext;
        private canvas: HTMLCanvasElement;
        private mMouseOriX: number = 0;
        private mMouseOriY: number = 0;
        private mMousePosX: number = 0;
        private mMousePosY: number = 0;
        private mMouseIsDown: boolean = false;
        private mMouseSignalDown: boolean = false;
        constructor(webgl2: WebGL2RenderingContext) {
            this.webgl2 = webgl2;
            this.canvas = webgl2.canvas as any;
            this.refreshCanvasSize();

            //reg event
            this.canvas.onmousedown = this.onmousedown.bind(this);
            this.canvas.onmousemove = this.onmousemove.bind(this);
            this.canvas.onmouseup = this.onmouseup.bind(this);
        }

        private onmouseup(ev) {
            this.mMouseIsDown = false;
            // if (this.mIsPaused) this.mForceFrame = true;
        }

        private onmousemove(ev) {
            if (!this.mMouseIsDown) return;
            let canvas = this.canvas;
            var rect = canvas.getBoundingClientRect();
            this.mMousePosX = Math.floor((ev.clientX - rect.left) / (rect.right - rect.left) * canvas.width);
            this.mMousePosY = Math.floor(this.canvas.height - (ev.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height);
            // if (this.mIsPaused) this.mForceFrame = true;
        }

        private onmousedown(ev) {
            let canvas = this.webgl2.canvas;
            var rect = (canvas as any).getBoundingClientRect();
            this.mMouseOriX = Math.floor((ev.clientX - rect.left) / (rect.right - rect.left) * canvas.width);
            this.mMouseOriY = Math.floor(canvas.height - (ev.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height);
            this.mMousePosX = this.mMouseOriX;
            this.mMousePosY = this.mMouseOriY;
            this.mMouseIsDown = true;
            this.mMouseSignalDown = true;
            // if (this.mIsPaused) this.mForceFrame = true;
        }

        /**
         * start to run.
         * @param sToyData a json data from shadertoy .
         */
        public run(data: SToyData) {
            let gl = this.webgl2;
            if (!data) { data = {} as any }
            if (!data.Image) { data.Image = { code: "" } }
            if (!data.Image.code) data.Image.code = sToyTest;

            //??????shader , ?????? glProgram
            let vs_code: string = baseVS;
            let fs_code: string = baseFS.replace(STNPlayer.INSERT_TAG, data.Image.code);
            //???????????????,?????????????????????
            let vs = gl.createShader(gl.VERTEX_SHADER);
            let fs = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(vs, vs_code);
            gl.shaderSource(fs, fs_code);
            //?????????????????????????????????????????????,??????webgl??????
            gl.compileShader(vs);
            //??????shader????????????
            this.ckShaderCompileS(vs, "VS");
            gl.compileShader(fs);
            this.ckShaderCompileS(fs, "FS");
            //?????? glProgram
            let program = gl.createProgram();
            gl.attachShader(program, vs);
            gl.attachShader(program, fs);
            gl.linkProgram(program);
            //??????link program
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                let info = gl.getProgramInfoLog(program);
                console.error(`linkProgram error : ${info}`);
            }

            //gl ??????
            gl.hint(gl.FRAGMENT_SHADER_DERIVATIVE_HINT, gl.NICEST);

            //?????? program
            gl.useProgram(program);

            //??????????????????
            //???????????????????????????? ???????????????????????????????????????????????????????????????????????????????????? gl_FragCoord + iResolution ??????????????????UV???
            //        0
            //      /   \
            //     /     \
            //   2 ------- 1
            //
            let quadMeshData = {
                poss: [0, 3, 2, -1, -2, -1]
            };

            //??????buffer,???????????????GPU
            let fullMesh = {
                glPosBuffer: this.setGLData(new Float32Array(quadMeshData.poss)),
            }

            //attrib ??????
            //pos 
            let aPositionAddr = gl.getAttribLocation(program, "a_Position");    //????????? Attrib ??? ?????? "a_Position" ???????????????
            gl.bindBuffer(gl.ARRAY_BUFFER, fullMesh.glPosBuffer);   //???????????????????????? ???????????????
            //??????????????????????????????????????????bindBuffer()?????????????????????????????????????????? (?????????????????????)
            gl.vertexAttribPointer(aPositionAddr, 2, gl.FLOAT, false, 0, 0);  //??????GPU???"a_Position" ??????????????????????????????????????????
            //????????????
            gl.enableVertexAttribArray(aPositionAddr);

            //????????????
            let baseDraw = () => {
                //????????????
                gl.drawArrays(gl.TRIANGLES, 0, 3);
            }

            //????????????
            let time = Date.now();
            let frame = 0;
            let totalTimeSec = 0;
            let loop = () => {
                if (!this.webgl2) return;   //isdispoed
                let nowTime = Date.now();
                let dt = (nowTime - time) * 0.001;
                totalTimeSec += dt;
                time = nowTime;
                //uniform ??????
                //shaderToy ??????uniform ??????
                let iResolutionAddr = gl.getUniformLocation(program, "iResolution");
                gl.uniform3f(iResolutionAddr, gl.canvas.width, gl.canvas.height, 1);
                let iTimeAddr = gl.getUniformLocation(program, "iTime");
                gl.uniform1f(iTimeAddr, totalTimeSec);
                let iTimeDeltaAddr = gl.getUniformLocation(program, "iTimeDelta");
                gl.uniform1f(iTimeDeltaAddr, dt);
                let iMouseAddr = gl.getUniformLocation(program, "iMouse");
                gl.uniform4f(iMouseAddr, this.mMousePosX, this.mMousePosY, this.mMouseOriX, this.mMouseOriY);
                let iFrameAddr = gl.getUniformLocation(program, "iFrame");
                gl.uniform1i(iFrameAddr, frame);

                //??????
                baseDraw();
                //????????????
                requestAnimationFrame(loop);    //??????:?????????????????????????????????setTimeout ?????????????????????????????????????????????
                frame++;
            };

            loop();
        }

        /**
         * refresh Canvas size
         */
        public refreshCanvasSize() {
            let gl = this.webgl2;
            let canvas = gl.canvas;
            canvas.width = canvas["clientWidth"];
            canvas.height = canvas["clientHeight"];
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.scissor(0, 0, gl.canvas.width, gl.canvas.height);
        }

        /**
         * dispose this object.
         */
        public dispose() {

            this.webgl2 = null;
            this.canvas = null;
        }

        //upload data of glbuffer
        private setGLData(data: BufferSource, target = this.webgl2.ARRAY_BUFFER, usage = this.webgl2.STATIC_DRAW) {
            let gl = this.webgl2;
            let glBuffer = gl.createBuffer();
            gl.bindBuffer(target, glBuffer);
            gl.bufferData(target, data, usage);            //data set to webglBuffer
            return glBuffer;
        };

        //check in shader error of compileing
        private ckShaderCompileS(sh: WebGLShader, info = "") {
            let gl = this.webgl2;
            let s = gl.getShaderParameter(sh, gl.COMPILE_STATUS);
            if (s == false) {
                let log = gl.getShaderInfoLog(sh);
                console.error(`compiles shader error : ${info} \n ${log} `);
            }
        }
    }
}