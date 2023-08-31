import { 
    createQwikRouteHandler,
    createUploadthing,
    type FileRouter
} from 'uploadthing/qwik'

const f = createUploadthing()

export const ourFileRouter = {
    imageUploader: f({ image: { maxFileSize: "4MB" } })
      .onUploadComplete(async ({ file }) => {   
        console.log("file url", file.url);
      }),
  } satisfies FileRouter;

const { onGet, onPost } = createQwikRouteHandler({
    router: ourFileRouter
})

export {
    onGet,
    onPost
}
