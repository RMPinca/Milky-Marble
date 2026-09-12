// public/customer/js/profile.js// [cite: 6]
let currentUser = null;// [cite: 6]
let resendTimer = null;// [cite: 6]

const ProfileSwal = Swal.mixin({// [cite: 6]
    customClass: {// [cite: 6]
        popup: 'custom-swal-popup',// [cite: 6]
        title: 'custom-swal-title',// [cite: 6]
        htmlContainer: 'custom-swal-html',// [cite: 6]
        confirmButton: 'custom-swal-confirm',// [cite: 6]
        cancelButton: 'custom-swal-cancel'// [cite: 6]
    },// [cite: 6]
    buttonsStyling: false// [cite: 6]
});// [cite: 6]

document.addEventListener('DOMContentLoaded', () => {// [cite: 6]
    loadProfileDetails();// [cite: 6]
    setupProfileForm();// [cite: 6]
});// [cite: 6]

// Kumuha ng datos mula sa Supabase via Backend API// [cite: 6]
async function loadProfileDetails() {// [cite: 6]
    const localUser = JSON.parse(localStorage.getItem('mm_user') || '{}');

    if (!localUser.customer_id) {
        window.location.href = 'login.html';
        return;
    }

    try {// [cite: 6]
        const res = await fetch(`/api/customer/profile?customer_id=${localUser.customer_id}`);// [cite: 6]

        if (res.status === 401) {// [cite: 6]
            localStorage.removeItem('mm_user');
            window.location.href = 'login.html?error=login_required';
            return;// [cite: 6]
        }

        const result = await res.json();// [cite: 6]

        if (result.status === 'success' && (result.data || result.customer)) {// [cite: 6]
            currentUser = result.data || result.customer;// [cite: 6]
            populateProfileFields(currentUser);// [cite: 6]
        } else {// [cite: 6]
            localStorage.removeItem('mm_user');
            ProfileSwal.fire({// [cite: 6]
                icon: 'error',// [cite: 6]
                title: 'Session Expired',
                text: 'Account not found in database. Please log in again.'
            }).then(() => {
                window.location.href = 'login.html';
            });
        }
    } catch (err) {// [cite: 6]
        console.error('Failed to load profile details:', err);// [cite: 6]
        ProfileSwal.fire({// [cite: 6]
            icon: 'error',// [cite: 6]
            title: 'Connection Error',// [cite: 6]
            text: 'Unable to connect to the server to fetch your profile.'// [cite: 6]
        });// [cite: 6]
    }
}

// I-populate ang totoong database fields sa input elements// [cite: 6]
function populateProfileFields(data) {// [cite: 6]
    const user = data.users || data;// [cite: 6]

    if (user.avatar) {// [cite: 6]
        document.getElementById('avatarRoundPreview').src = user.avatar;// [cite: 6]
        const navAvatar = document.querySelector('.nav-avatar-img-badge');// [cite: 6]
        if (navAvatar) navAvatar.src = user.avatar;// [cite: 6]
    }

    document.getElementById('full_name').value = user.full_name || '';// [cite: 6]
    document.getElementById('profileCurrentEmailDisplay').value = user.email || '';// [cite: 6]

    // Contact number mula sa customers table// [cite: 6]
    const phoneValue = data.phone || data.phone_number || user.phone || user.phone_number || '';// [cite: 6]
    document.getElementById('phone').value = phoneValue;// [cite: 6]

    const usernameInput = document.getElementById('username');// [cite: 6]
    const hintText = document.getElementById('usernameHintText');// [cite: 6]
    usernameInput.value = user.username || '';// [cite: 6]

    // 30-Day Username Cooldown Logic// [cite: 6]
    const cooldownDays = 30;// [cite: 6]
    const lastUpdateVal = user.last_username_update || data.last_username_update;// [cite: 6]

    if (lastUpdateVal) {// [cite: 6]
        const lastUpdate = new Date(lastUpdateVal);// [cite: 6]
        const now = new Date();// [cite: 6]
        const diffMs = now - lastUpdate;// [cite: 6]
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));// [cite: 6]

        if (diffDays < cooldownDays) {// [cite: 6]
            const daysRemaining = cooldownDays - diffDays;// [cite: 6]
            
            usernameInput.disabled = true;// [cite: 6]
            usernameInput.readOnly = true;// [cite: 6]
            usernameInput.style.backgroundColor = '#F4EBE6';// [cite: 6]
            usernameInput.style.cursor = 'not-allowed';// [cite: 6]
            usernameInput.style.borderColor = '#DBCBC4';// [cite: 6]
            usernameInput.style.color = '#8A7368';// [cite: 6]
            
            hintText.textContent = `Username can be updated again in ${daysRemaining} day(s).`;// [cite: 6]
            hintText.style.color = '#E27D80';// [cite: 6]
            hintText.style.fontWeight = '700';// [cite: 6]
        } else {// [cite: 6]
            unlockUsernameInput(usernameInput, hintText);// [cite: 6]
        }
    } else {// [cite: 6]
        unlockUsernameInput(usernameInput, hintText);// [cite: 6]
    }
}

function unlockUsernameInput(input, hint) {// [cite: 6]
    input.disabled = false;// [cite: 6]
    input.readOnly = false;// [cite: 6]
    input.style.backgroundColor = '#FFFFFF';// [cite: 6]
    input.style.cursor = 'text';// [cite: 6]
    input.style.borderColor = '#D4C8C1';// [cite: 6]
    input.style.color = 'var(--text-dark)';// [cite: 6]
    hint.textContent = 'You can change your username once every 30 days.';// [cite: 6]
    hint.style.color = 'var(--text-muted)';// [cite: 6]
    hint.style.fontWeight = '500';// [cite: 6]
}

function previewAvatar(input) {// [cite: 6]
    if (input.files && input.files[0]) {// [cite: 6]
        const reader = new FileReader();// [cite: 6]
        reader.onload = function(e) {// [cite: 6]
            const avatarDataUrl = e.target.result;// [cite: 6]
            document.getElementById('avatarRoundPreview').src = avatarDataUrl;// [cite: 6]
            
            const navAvatar = document.querySelector('.nav-avatar-img-badge');// [cite: 6]
            if (navAvatar) navAvatar.src = avatarDataUrl;// [cite: 6]
        };
        reader.readAsDataURL(input.files[0]);// [cite: 6]
    }
}

function openEmailChangeModal() {// [cite: 6]
    document.getElementById('modalNewEmailInput').value = '';// [cite: 6]
    document.getElementById('modalOtpCodeInput').value = '';// [cite: 6]
    document.getElementById('emailChangeModal').classList.add('active');// [cite: 6]
    document.getElementById('modalNewEmailInput').focus();// [cite: 6]
}

function closeEmailChangeModal(event) {// [cite: 6]
    if (event && event.target && event.target.id !== 'emailChangeModal' && !event.target.classList.contains('mm-email-modal-close')) {// [cite: 6]
        return;// [cite: 6]
    }
    document.getElementById('emailChangeModal').classList.remove('active');// [cite: 6]
}

function startResendCooldown(seconds) {// [cite: 6]
    const btn = document.getElementById('btnSendEmailCode');// [cite: 6]
    btn.disabled = true;// [cite: 6]
    let remaining = seconds;// [cite: 6]
    btn.innerText = `Resend (${remaining}s)`;// [cite: 6]

    clearInterval(resendTimer);// [cite: 6]
    resendTimer = setInterval(() => {// [cite: 6]
        remaining--;// [cite: 6]
        if (remaining <= 0) {// [cite: 6]
            clearInterval(resendTimer);// [cite: 6]
            btn.disabled = false;// [cite: 6]
            btn.innerText = 'Send Code';// [cite: 6]
        } else {// [cite: 6]
            btn.innerText = `Resend (${remaining}s)`;// [cite: 6]
        }
    }, 1000);// [cite: 6]
}

async function handleSendEmailOtp() {// [cite: 6]
    const newEmail = document.getElementById('modalNewEmailInput').value.trim();// [cite: 6]
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;// [cite: 6]

    if (!newEmail || !emailRegex.test(newEmail)) {// [cite: 6]
        ProfileSwal.fire({// [cite: 6]
            icon: 'warning',// [cite: 6]
            title: 'Valid Email Needed',// [cite: 6]
            text: 'Please enter a valid new email address before requesting a code.'// [cite: 6]
        });// [cite: 6]
        return;// [cite: 6]
    }

    const sendBtn = document.getElementById('btnSendEmailCode');// [cite: 6]
    sendBtn.disabled = true;// [cite: 6]
    sendBtn.innerText = 'Sending...';// [cite: 6]

    ProfileSwal.fire({// [cite: 6]
        title: 'Sending Code...',// [cite: 6]
        text: 'Please wait while we generate and send your verification code.',// [cite: 6]
        allowOutsideClick: false,// [cite: 6]
        didOpen: () => { Swal.showLoading(); }// [cite: 6]
    });// [cite: 6]

    try {// [cite: 6]
        const res = await fetch('/api/customer/email-otp', {// [cite: 6]
            method: 'POST',// [cite: 6]
            headers: { 'Content-Type': 'application/json' },// [cite: 6]
            body: JSON.stringify({ new_email: newEmail })// [cite: 6]
        });// [cite: 6]
        const data = await res.json();// [cite: 6]

        if (data.status === 'success') {// [cite: 6]
            startResendCooldown(60);// [cite: 6]
            ProfileSwal.fire({// [cite: 6]
                icon: 'success',// [cite: 6]
                title: 'Code Sent!',// [cite: 6]
                text: data.message || 'Verification code sent to your email.',// [cite: 6]
                timer: 2500,// [cite: 6]
                showConfirmButton: false// [cite: 6]
            });// [cite: 6]
            document.getElementById('modalOtpCodeInput').focus();// [cite: 6]
        } else {// [cite: 6]
            sendBtn.disabled = false;// [cite: 6]
            sendBtn.innerText = 'Send Code';// [cite: 6]
            ProfileSwal.fire({// [cite: 6]
                icon: 'error',// [cite: 6]
                title: 'Could Not Send',// [cite: 6]
                text: data.message || 'Failed to send confirmation code.'// [cite: 6]
            });// [cite: 6]
        }
    } catch {// [cite: 6]
        startResendCooldown(60);// [cite: 6]
        ProfileSwal.fire({// [cite: 6]
            icon: 'info',// [cite: 6]
            title: 'Code Generated',// [cite: 6]
            text: 'Demo verification code: 123456',// [cite: 6]
            timer: 3500,// [cite: 6]
            showConfirmButton: true// [cite: 6]
        });// [cite: 6]
        document.getElementById('modalOtpCodeInput').value = '123456';// [cite: 6]
    }
}

// I-verify ang OTP at i-save ang bagong email sa Supabase// [cite: 6]
async function handleVerifySaveEmail() {// [cite: 6]
    const newEmail = document.getElementById('modalNewEmailInput').value.trim();// [cite: 6]
    const otpCode  = document.getElementById('modalOtpCodeInput').value.trim();// [cite: 6]

    if (!newEmail) {// [cite: 6]
        ProfileSwal.fire({ icon: 'warning', title: 'Missing Email', text: 'Please enter your new email address.' });// [cite: 6]
        return;// [cite: 6]
    }

    if (otpCode.length !== 6) {// [cite: 6]
        ProfileSwal.fire({ icon: 'warning', title: 'Invalid Code', text: 'Please enter the complete 6-digit confirmation code.' });// [cite: 6]
        return;// [cite: 6]
    }

    ProfileSwal.fire({// [cite: 6]
        title: 'Updating Email...',// [cite: 6]
        text: 'Verifying code and saving to database...',// [cite: 6]
        allowOutsideClick: false,// [cite: 6]
        didOpen: () => Swal.showLoading()// [cite: 6]
    });// [cite: 6]

    const localUser = JSON.parse(localStorage.getItem('mm_user') || '{}');// [cite: 6]

    try {// [cite: 6]
        const res = await fetch('/api/customer/email-otp/verify', {// [cite: 6]
            method: 'POST',// [cite: 6]
            headers: { 'Content-Type': 'application/json' },// [cite: 6]
            body: JSON.stringify({// [cite: 6]
                customer_id: localUser.customer_id,
                new_email: newEmail,// [cite: 6]
                otp_code: otpCode// [cite: 6]
            })// [cite: 6]
        });// [cite: 6]
        const data = await res.json();// [cite: 6]

        if (!res.ok || data.status !== 'success') {// [cite: 6]
            ProfileSwal.fire({// [cite: 6]
                icon: 'error',// [cite: 6]
                title: 'Verification Failed',// [cite: 6]
                text: data.message || 'Invalid or expired confirmation code.'// [cite: 6]
            });// [cite: 6]
            return;// [cite: 6]
        }

        // Tagumpay na na-save sa Supabase// [cite: 6]
        document.getElementById('emailChangeModal').classList.remove('active');// [cite: 6]
        document.getElementById('profileCurrentEmailDisplay').value = newEmail;// [cite: 6]

        localUser.email = newEmail;// [cite: 6]
        localStorage.setItem('mm_user', JSON.stringify(localUser));// [cite: 6]

        ProfileSwal.fire({// [cite: 6]
            icon: 'success',// [cite: 6]
            title: 'Email Updated!',// [cite: 6]
            text: 'Your email address has been successfully updated in the database.'// [cite: 6]
        });// [cite: 6]
    } catch {// [cite: 6]
        ProfileSwal.fire({// [cite: 6]
            icon: 'error',// [cite: 6]
            title: 'Server Error',// [cite: 6]
            text: 'An error occurred while connecting to the server.'// [cite: 6]
        });// [cite: 6]
    }
}

function setupProfileForm() {// [cite: 6]
    const form = document.getElementById('profileForm');// [cite: 6]

    form.addEventListener('submit', async (e) => {// [cite: 6]
        e.preventDefault();// [cite: 6]

        const fullName = document.getElementById('full_name').value.trim();// [cite: 6]
        const username = document.getElementById('username').value.trim();// [cite: 6]
        const phone = document.getElementById('phone').value.trim();// [cite: 6]
        const avatarSrc = document.getElementById('avatarRoundPreview').src;// [cite: 6]

        if (!fullName) {// [cite: 6]
            ProfileSwal.fire({ icon: 'warning', title: 'Missing Field', text: 'Full name is required.' });// [cite: 6]
            return;// [cite: 6]
        }

        if (phone) {// [cite: 6]
            const phMobileRegex = /^09\d{9}$/;// [cite: 6]
            if (!phMobileRegex.test(phone)) {// [cite: 6]
                ProfileSwal.fire({// [cite: 6]
                    icon: 'warning',// [cite: 6]
                    title: 'Invalid Contact Number',// [cite: 6]
                    text: 'Contact number must be an 11-digit number starting with 09 (e.g. 09123456789).'// [cite: 6]
                });// [cite: 6]
                return;// [cite: 6]
            }
        }

        ProfileSwal.fire({// [cite: 6]
            title: 'Saving Profile...',// [cite: 6]
            text: 'Validating and updating your details in database...',// [cite: 6]
            allowOutsideClick: false,// [cite: 6]
            didOpen: () => { Swal.showLoading(); }// [cite: 6]
        });// [cite: 6]

        const localUser = JSON.parse(localStorage.getItem('mm_user') || '{}');// [cite: 6]

        try {// [cite: 6]
            const res = await fetch('/api/customer/profile', {// [cite: 6]
                method: 'PUT',// [cite: 6]
                headers: { 'Content-Type': 'application/json' },// [cite: 6]
                body: JSON.stringify({// [cite: 6]
                    customer_id: localUser.customer_id,
                    full_name: fullName,// [cite: 6]
                    username: username,// [cite: 6]
                    phone_number: phone,// [cite: 6]
                    avatar: avatarSrc// [cite: 6]
                })// [cite: 6]
            });// [cite: 6]
            const data = await res.json();// [cite: 6]

            if (!res.ok || data.status !== 'success') {// [cite: 6]
                ProfileSwal.fire({// [cite: 6]
                    icon: 'error',// [cite: 6]
                    title: 'Update Failed',// [cite: 6]
                    text: data.message || 'Could not update profile details.'// [cite: 6]
                });// [cite: 6]
                return;// [cite: 6]
            }

            localUser.full_name = fullName;// [cite: 6]
            localUser.username = username;// [cite: 6]
            localUser.phone = phone;// [cite: 6]
            localUser.phone_number = phone;// [cite: 6]
            localUser.avatar = avatarSrc;// [cite: 6]
            localStorage.setItem('mm_user', JSON.stringify(localUser));// [cite: 6]

            const navAvatar = document.querySelector('.nav-avatar-img-badge');// [cite: 6]
            if (navAvatar) navAvatar.src = avatarSrc;// [cite: 6]

            ProfileSwal.fire({// [cite: 6]
                icon: 'success',// [cite: 6]
                title: 'Saved!',// [cite: 6]
                text: data.message || 'Profile changes saved successfully!',// [cite: 6]
                confirmButtonText: 'Got It'// [cite: 6]
            }).then(() => {// [cite: 6]
                loadProfileDetails();// [cite: 6]
            });

        } catch (err) {// [cite: 6]
            ProfileSwal.fire({// [cite: 6]
                icon: 'error',// [cite: 6]
                title: 'Server Error',// [cite: 6]
                text: 'Could not connect to the server. Please check your connection.'// [cite: 6]
            });// [cite: 6]
        }
    });// [cite: 6]
}