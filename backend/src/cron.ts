import cron from 'node-cron';
import { getPlacesFromBestTime } from './services/bestTime.service';

console.log('🔄 Setting up cron jobs...');
// Schedule the job to run every day at 3 AM
const job = cron.schedule(
    '0 3 * * *',
    async () => {
        try {
            console.log('Executando atualização diária de dados...');

            const defaultLat = 52.2300137946975;
            const defaultLng = 21.011590957893365;
            const types = 'BAR,CLUBS,CAFE';
            const limit = 50;

            await getPlacesFromBestTime(
                { lat: defaultLat, lng: defaultLng },
                types,
                limit,
                false
            );

            console.log('Atualização diária concluída com sucesso!');
        } catch (error) {
            console.error('Erro na atualização diária:', error);
        }
    },
    {
        timezone: 'Europe/Warsaw'
    }
);

// Handle process termination
process.on('SIGINT', () => {
    console.log('\nStopping cron jobs...');
    job.stop();
});

export default job;