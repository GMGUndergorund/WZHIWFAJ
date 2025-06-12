// Main JavaScript for Game Hub

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Auto-hide alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
    alerts.forEach(function(alert) {
        setTimeout(function() {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });

    // Search form enhancements
    const searchForm = document.querySelector('form[action*="index"]');
    if (searchForm) {
        // Auto-submit on filter change (optional)
        const filterInputs = searchForm.querySelectorAll('select');
        filterInputs.forEach(function(input) {
            input.addEventListener('change', function() {
                // Optional: Auto-submit form when filters change
                // searchForm.submit();
            });
        });

        // Clear search functionality
        const searchInput = searchForm.querySelector('input[name="search"]');
        if (searchInput && searchInput.value) {
            // Add clear button functionality if needed
        }
    }

    // Game card hover effects
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(function(card) {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Download tracking
    window.trackDownload = function(gameId) {
        // Track download analytics
        fetch(`/api/track-download/${gameId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        }).catch(function(error) {
            console.log('Download tracking failed:', error);
        });
    };

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Loading states for forms
    const forms = document.querySelectorAll('form');
    forms.forEach(function(form) {
        form.addEventListener('submit', function() {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Processing...';
                
                // Re-enable after 10 seconds as fallback
                setTimeout(function() {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }, 10000);
            }
        });
    });

    // Table row click handlers
    const tableRows = document.querySelectorAll('table tbody tr[data-href]');
    tableRows.forEach(function(row) {
        row.addEventListener('click', function() {
            window.location.href = this.dataset.href;
        });
    });

    // Copy to clipboard functionality
    window.copyToClipboard = function(text) {
        navigator.clipboard.writeText(text).then(function() {
            // Show success message
            showToast('Copied to clipboard!', 'success');
        }).catch(function(err) {
            console.error('Could not copy text: ', err);
            showToast('Failed to copy to clipboard', 'error');
        });
    };

    // Toast notification system
    window.showToast = function(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container') || createToastContainer();
        
        const toastEl = document.createElement('div');
        toastEl.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type} border-0`;
        toastEl.setAttribute('role', 'alert');
        toastEl.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        toastContainer.appendChild(toastEl);
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
        
        // Remove toast element after it's hidden
        toastEl.addEventListener('hidden.bs.toast', function() {
            toastEl.remove();
        });
    };

    function createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
        return container;
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('input[name="search"]');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
    });

    // Responsive table handling
    const tables = document.querySelectorAll('.table-responsive table');
    tables.forEach(function(table) {
        if (table.scrollWidth > table.clientWidth) {
            table.parentElement.classList.add('table-scroll-indicator');
        }
    });

    // Back to top button
    const backToTopBtn = createBackToTopButton();
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.style.display = 'block';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });

    function createBackToTopButton() {
        const btn = document.createElement('button');
        btn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        btn.className = 'btn btn-primary position-fixed';
        btn.style.cssText = `
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            display: none;
            width: 50px;
            height: 50px;
            border-radius: 50%;
        `;
        btn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        document.body.appendChild(btn);
        return btn;
    }

    console.log('Game Hub initialized successfully');
});
