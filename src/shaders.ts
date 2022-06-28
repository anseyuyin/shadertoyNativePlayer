namespace STNativePlayer {
    export let baseVS = `#version 300 es
        #ifdef GL_ES
            precision highp float;
            precision highp int;
            precision mediump sampler3D;
        #endif
        in vec2 a_Position; //顶点 位置 是有默认值的 (0,0,0,1)
        void main() {
            gl_Position = vec4(a_Position.xy, 0.0 , 1.0);
        }
    `;

    export let baseFS = `#version 300 es
        #ifdef GL_ES
            precision highp float;
            precision highp int;
            precision mediump sampler3D;
        #endif
        #define HW_PERFORMANCE 1

        out vec4 color;
        //uniforms
        uniform vec3      iResolution;
        uniform float     iTime;
        //uniform float     iChannelTime[4];
        uniform vec4      iMouse;
        //uniform vec4      iDate;
        //uniform float     iSampleRate;
        //uniform vec3      iChannelResolution[4];
        uniform int       iFrame;
        uniform float     iTimeDelta;

        //=#*INSERT_LOCATION*#=

        void main(){
            //color = vec4(0.0 , 1.0 , 0.0 , 1.0);
            vec4 col = vec4(0.0 , 0.0 , 0.0 , 1.0);
            mainImage(col , gl_FragCoord.xy);
            color = col;
        }
    `;

    export let sToyTest = `
    void mainImage( out vec4 fragColor, in vec2 fragCoord )
    {
        // Normalized pixel coordinates (from 0 to 1)
        vec2 uv = fragCoord/iResolution.xy;
    
        // Time varying pixel color
        vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));
    
        // Output to screen
        fragColor = vec4(col,1.0);
    }
    `;
}