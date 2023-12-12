document.getElementById('study-resources').addEventListener('click', function() {
    const resourcesContent = document.getElementById('resources-content');
    // Prosta funkcja przełączająca widoczność zasobów
    if (resourcesContent.style.display === 'block') {
        resourcesContent.style.display = 'none';
    } else {
        resourcesContent.style.display = 'block';
    }
});
function toggleResources() {
    var resourcesContent = document.getElementById('resources-content');
    resourcesContent.classList.toggle('hide');
}