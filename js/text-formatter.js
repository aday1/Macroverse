/**
 * Text Formatter for better paragraph readability
 * Formats the long paragraph text into proper paragraphs
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Text formatter loaded');
    
    // Find the placeholder content and format it
    const placeholderContent = document.querySelector('.placeholder-content');
    if (placeholderContent) {
        const paragraph = placeholderContent.querySelector('p');
        if (paragraph) {
            const fullText = paragraph.textContent || paragraph.innerText;
            
            // Split the text into logical paragraphs (removed placeholder text)
            const paragraphs = [
                "Electronic music artist Reductionist, collaborating with projection artist Aday, will utilise the humblest of ephemeral technologies, including battery-powered micro-instruments, open-source coding and apps, to express the vastest concepts that we, as humans, can attempt to comprehend.",
                
                "Pushing the limits of microvirtuosity, Reductionist and Aday will draw upon their decades of experience in live improvised and technologically-mediated performance over five nights as part of the Abbotsford Convent's experimental art program in the Melbourne Fringe. Drones, ambience, soundscapes and synth riffs will combine with projections, laser sequences, and digital pointillism in MacroVerse for an audiovisual experience exploring the edges of knowledge.",
                
                "Reductionist is the solo project for electronic music artist Nick Wilson, whose previous work has included Random Acts of Elevator Music, Tiatto, City Frequencies and Continuum. Aday is a multimedia artist who experiments with obsolete and cutting-edge audio, video and coding technologies, his work previously seen at the Square Sounds, Pause, and CERES Winter Solstice festivals. They are both long-term members of Australia's electronic music collective Clan Analogue and last worked together for the Sonic Selections, Spectral Visions performances in the 2023 Melbourne Fringe.",
                
                "The Abbotsford Convent's experimental art program will run in the Oratory space at the Convent from Tuesday the 7th to Saturday the 11th of October from 6pm to 10pm each night.",
                
                "Tickets are available from the Melbourne Fringe website. This project has been Fringe funded."
            ];
            
            // Replace the single paragraph with multiple formatted paragraphs
            const newHTML = paragraphs.map(p => `<p>${p}</p>`).join('\n                            ');
            placeholderContent.innerHTML = newHTML;
            
            console.log('Text formatted into', paragraphs.length, 'paragraphs');
        }
    }
});
