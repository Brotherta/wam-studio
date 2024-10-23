class ThreadPool{

    private workers: TaskWorker[] = []

    private constructor(){}

    static async create(): Promise<ThreadPool>{
        const pool = new ThreadPool()
        for(let i=0; i<navigator.hardwareConcurrency; i++){
            const worker = new Worker(new URL("TaskWorkerCode.js", import.meta.url), {type: "module"})
            await postAsyncMessage(worker, {workerId: i})
            pool.workers.push({ worker, busy: false })
            await worker
        }
        return pool
    }

    dispose(){

    }
}

let promiseId=0

function postAsyncMessage(worker: Worker, message: any): Promise<void>{
    return new Promise<void>((resolve, reject)=>{
        promiseId++
        const currentId=promiseId
        const handler: (event:MessageEvent)=>void = (event)=>{
            if(event.data.resolve_promis_id===currentId){
                worker.removeEventListener("message", handler)
            }
        }
        worker.addEventListener("message", handler)
        worker.postMessage({...message, promise_resolve_id_send: currentId})
    })
}

interface TaskWorker{
    worker: Worker
    busy: boolean
}