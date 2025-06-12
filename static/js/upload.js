// Upload functionality for Game Hub

document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('logoFile');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const dropZoneContent = document.getElementById('dropZoneContent');
    const form = document.getElementById('uploadForm') || document.getElementById('editForm');

    if (!dropZone || !fileInput) return;

    // Click to upload
    dropZone.addEventListener('click', function(e) {
        if (e.target.tagName !== 'BUTTON') {
            fileInput.click();
        }
    });

    // File input change
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    });

    // Drag and drop events
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        if (!dropZone.contains(e.relatedTarget)) {
            dropZone.classList.remove('drag-over');
        }
    });

    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                fileInput.files = files;
                handleFile(file);
            } else {
                showError('Please upload an image file (JPG, PNG, GIF)');
            }
        }
    });

    function handleFile(file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showError('Please upload an image file (JPG, PNG, GIF)');
            return;
        }

        // Validate file size (16MB max)
        const maxSize = 16 * 1024 * 1024; // 16MB
        if (file.size > maxSize) {
            showError('File size must be less than 16MB');
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            showPreview();
        };
        reader.readAsDataURL(file);
    }

    function showPreview() {
        dropZoneContent.style.display = 'none';
        imagePreview.style.display = 'block';
    }

    function hidePreview() {
        dropZoneContent.style.display = 'block';
        imagePreview.style.display = 'none';
        previewImg.src = '';
        fileInput.value = '';
    }

    // Remove image function
    window.removeImage = function() {
        hidePreview();
    };

    function showError(message) {
        // Create or update error message
        let errorDiv = document.getElementById('upload-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'upload-error';
            errorDiv.className = 'alert alert-danger mt-2';
            dropZone.parentNode.appendChild(errorDiv);
        }
        
        errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle me-1"></i>${message}`;
        
        // Auto-hide after 5 seconds
        setTimeout(function() {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    // Form validation
    if (form) {
        form.addEventListener('submit', function(e) {
            const title = document.getElementById('title').value.trim();
            const description = document.getElementById('description').value.trim();
            const downloadLink = document.getElementById('download_link').value.trim();

            // Basic validation
            if (!title) {
                e.preventDefault();
                showFormError('Please enter a game title');
                document.getElementById('title').focus();
                return;
            }

            if (!description) {
                e.preventDefault();
                showFormError('Please enter a game description');
                document.getElementById('description').focus();
                return;
            }

            if (!downloadLink) {
                e.preventDefault();
                showFormError('Please enter a download link');
                document.getElementById('download_link').focus();
                return;
            }

            // Validate URL format
            try {
                new URL(downloadLink);
            } catch {
                e.preventDefault();
                showFormError('Please enter a valid download URL');
                document.getElementById('download_link').focus();
                return;
            }

            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Uploading...';
                
                // Re-enable after 30 seconds as fallback
                setTimeout(function() {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }, 30000);
            }
        });
    }

    function showFormError(message) {
        // Remove existing error
        const existingError = document.getElementById('form-error');
        if (existingError) {
            existingError.remove();
        }

        // Create new error
        const errorDiv = document.createElement('div');
        errorDiv.id = 'form-error';
        errorDiv.className = 'alert alert-danger';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle me-1"></i>${message}`;
        
        // Insert at the beginning of the form
        form.insertBefore(errorDiv, form.firstChild);
        
        // Scroll to error
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Auto-hide after 5 seconds
        setTimeout(function() {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    // Real-time URL validation
    const downloadLinkInput = document.getElementById('download_link');
    if (downloadLinkInput) {
        downloadLinkInput.addEventListener('blur', function() {
            const url = this.value.trim();
            if (url) {
                try {
                    new URL(url);
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                } catch {
                    this.classList.remove('is-valid');
                    this.classList.add('is-invalid');
                }
            } else {
                this.classList.remove('is-valid', 'is-invalid');
            }
        });
    }

    // Character counter for description
    const descriptionField = document.getElementById('description');
    if (descriptionField) {
        const maxLength = 1000;
        const counter = document.createElement('small');
        counter.className = 'form-text text-muted';
        counter.id = 'description-counter';
        descriptionField.parentNode.appendChild(counter);

        function updateCounter() {
            const length = descriptionField.value.length;
            counter.textContent = `${length}/${maxLength} characters`;
            
            if (length > maxLength * 0.9) {
                counter.className = 'form-text text-warning';
            } else {
                counter.className = 'form-text text-muted';
            }
        }

        descriptionField.addEventListener('input', updateCounter);
        updateCounter(); // Initial count
    }

    // Tag input enhancements
    const tagsInput = document.getElementById('tags');
    if (tagsInput) {
        tagsInput.addEventListener('input', function() {
            // Auto-format tags
            let value = this.value;
            
            // Remove multiple spaces and commas
            value = value.replace(/\s+/g, ' ').replace(/,+/g, ',');
            
            // Remove leading/trailing commas and spaces
            value = value.replace(/^[,\s]+|[,\s]+$/g, '');
            
            this.value = value;
        });

        tagsInput.addEventListener('blur', function() {
            // Final cleanup on blur
            let tags = this.value.split(',').map(tag => tag.trim()).filter(tag => tag);
            this.value = tags.join(', ');
        });
    }

    console.log('Upload functionality initialized');
});
