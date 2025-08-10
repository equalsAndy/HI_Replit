import { storage } from './storage';
async function listVideoIds() {
    try {
        const videos = await storage.getAllVideos();
        console.log('\nVideo IDs and titles:');
        videos.forEach(video => {
            console.log(`ID: ${video.id} - ${video.title} (${video.workshopType})`);
        });
    }
    catch (error) {
        console.error('Error fetching videos:', error);
    }
}
listVideoIds()
    .then(() => console.log('\nDone listing videos'))
    .catch(console.error);
