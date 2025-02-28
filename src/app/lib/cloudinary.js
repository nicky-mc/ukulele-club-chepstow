export const uploadImageToCloudinary = async ( file ) => {
    const formdata = new FormData();
    formdata.append( "file", file );
    formdata.append( "upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET );
    const res = await fetch( `https://api.cloudinary/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formdata,
    } );
    const data = await res.json();
    return data_secure_url;
}
