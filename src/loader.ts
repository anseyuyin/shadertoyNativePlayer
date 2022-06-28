namespace STNativePlayer {
    export type SToyConfig = {
        files: { Image: string, Common?: string, CubeA?: string, BufferA?: string, BufferB?: string, BufferC?: string, BufferD?: string }
    };

    /**
     * load tool 
     */
    export class Loader {
        public static enableRetry: boolean = false;
        private static xhr(url: string, rType: XMLHttpRequestResponseType): Promise<any> {
            return new Promise<any>((res, rej) => {
                let xhreq = new XMLHttpRequest();
                let success = false;
                xhreq.responseType = rType;
                xhreq.open("GET", url);
                xhreq.send();
                //event reg
                xhreq.onreadystatechange = () => {
                    if (xhreq.readyState == 4) {
                        switch (xhreq.status) {
                            case 200:
                                success = true;
                                res(xhreq.response);
                                break;
                            case 404: rej(new Error(`got a 404: ${url}`)); break;
                            default:
                        }
                    }
                };
                xhreq.onloadend = () => {
                    if (success) return;
                    if (!this.enableRetry) {
                        rej(new Error(`load fial: ${url}`));
                        return;
                    }
                    //加载失败 重试
                    console.log("加载失败 重试");
                };
                xhreq.onerror = (ev) => {
                    rej(new Error(`load error : ${url}`));
                };
            });
        }

        /**
         * load of stoyconfig datas
         * @param stoyPath 
         */
        public async loadSToy(stoyPath: string): Promise<SToyData> {
            let stoyCfgUrl = `${stoyPath}/stoyconfig.json`;
            let stoyD: SToyData = {} as any;
            let stoyObj: SToyConfig = await Loader.xhr(stoyCfgUrl, "json");
            //Image
            let IUrl = stoyObj.files.Image;
            if (IUrl) {
                let ICodeUrl = `${stoyPath}/${IUrl}`;
                let ICode = await Loader.xhr(ICodeUrl, "text");
                stoyD.Image = { code: ICode };
            }
            return stoyD;
        }

    }
}