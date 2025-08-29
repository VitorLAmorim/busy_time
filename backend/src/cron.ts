import cron from 'node-cron';
import { getPlacesFromBestTime } from './services/bestTime.service';

console.log('🔄 Setting up cron jobs...');
// Schedule the job to run every day at 3 AM
const job = cron.schedule(
    '0 3 * * *', // At 03:00 AM
    async () => {
        try {
            console.log('Starting scheduled update from BestTime...');
            await getPlacesFromBestTime({lat: 52.23001379469755, lng: 21.011590957893365}, 'BAR,CLUBS,CAFE');
            console.log('Successfully updated busy times');
        } catch (error) {
            console.error('Error in scheduled job:', error);
        }
    },
    {
        scheduled: true,
        timezone: 'Europe/Warsaw'
    }
);

// Handle process termination
process.on('SIGINT', () => {
    console.log('\nStopping cron jobs...');
    job.stop();
});

export default job;