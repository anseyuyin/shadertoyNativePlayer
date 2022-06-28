declare namespace STNativePlayer {
    type SToyUint = {
        code: string;
        ich0?: any;
        ich1?: any;
        ich2?: any;
        ich3?: any;
    };
    type SToyData = {
        Image: SToyUint;
        Common?: string;
        CubeA?: SToyUint;
        BufferA?: SToyUint;
        BufferB?: SToyUint;
        BufferC?: SToyUint;
        BufferD?: SToyUint;
    };
    class STNPlayer {
        private static readonly INSERT_TAG;
        private webgl2;
        private canvas;
        private mMouseOriX;
        private mMouseOriY;
        private mMousePosX;
        private mMousePosY;
        private mMouseIsDown;
        private mMouseSignalDown;
        constructor(webgl2: WebGL2RenderingContext);
        private onmouseup;
        private onmousemove;
        private onmousedown;
        /**
         * start to run.
         * @param sToyData a json data from shadertoy .
         */
        run(data: SToyData): void;
        /**
         * refresh Canvas size
         */
        refreshCanvasSize(): void;
        /**
         * dispose this object.
         */
        dispose(): void;
        private setGLData;
        private ckShaderCompileS;
    }
}
declare namespace STNativePlayer {
    type SToyConfig = {
        files: {
            Image: string;
            Common?: string;
            CubeA?: string;
            BufferA?: string;
            BufferB?: string;
            BufferC?: string;
            BufferD?: string;
        };
    };
    /**
     * load tool
     */
    class Loader {
        static enableRetry: boolean;
        private static xhr;
        /**
         * load of stoyconfig datas
         * @param stoyPath
         */
        loadSToy(stoyPath: string): Promise<SToyData>;
    }
}
declare namespace STNativePlayer {
    let baseVS: string;
    let baseFS: string;
    let sToyTest: string;
}
