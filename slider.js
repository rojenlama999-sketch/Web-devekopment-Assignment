
document.addEventListener("DOMContentLoaded", () => {
    // ====================================
    // MOBILE NAVIGATION
    // ====================================
    const menuButton = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (menuButton && navLinks) {
        menuButton.addEventListener("click", () => {
            const isOpen = navLinks.classList.toggle("open");

            menuButton.setAttribute("aria-expanded", String(isOpen));
            menuButton.setAttribute(
                "aria-label",
                isOpen ? "Close navigation" : "Open navigation"
            );
        });

        navLinks.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("open");
                menuButton.setAttribute("aria-expanded", "false");
                menuButton.setAttribute("aria-label", "Open navigation");
            });
        });
    }

    // ====================================
    // SCROLL REVEAL ANIMATIONS
    // ====================================
    const revealElements = document.querySelectorAll(".reveal");

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    obs.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12
        });

        revealElements.forEach(element => observer.observe(element));
    } else {
        revealElements.forEach(element => {
            element.classList.add("visible");
        });
    }

    // ====================================
    // ACTIVE NAVIGATION LINK
    // ====================================
    const sections = document.querySelectorAll("main section[id]");
    const navItems = document.querySelectorAll(
        '.nav-links a[href^="#"]'
    );

    if ("IntersectionObserver" in window) {
        const sectionObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                navItems.forEach(link => {
                    const active =
                        link.getAttribute("href") === `#${entry.target.id}`;

                    link.classList.toggle("active", active);
                });
            });
        }, {
            rootMargin: "-25% 0px -60% 0px"
        });

        sections.forEach(section => sectionObserver.observe(section));
    }

    // ====================================
    // INFINITE IMAGE SLIDER
    // ====================================
    const slider = document.querySelector(".slider");

    if (slider) {
        const track = slider.querySelector(".slider-track");
        const previousButton = slider.querySelector(".previous");
        const nextButton = slider.querySelector(".next");
        const dotsContainer = document.querySelector(".slider-dots");
        const status = document.querySelector(".slide-status");

        if (track && previousButton && nextButton && dotsContainer && status) {
            const slides = Array.from(track.children);
            const total = slides.length;

            if (total > 0) {
                // Duplicate the first and last slides for looping.
                const firstClone = slides[0].cloneNode(true);
                const lastClone = slides[total - 1].cloneNode(true);

                firstClone.setAttribute("aria-hidden", "true");
                lastClone.setAttribute("aria-hidden", "true");

                firstClone.querySelectorAll("img").forEach(img => {
                    img.alt = "";
                });

                lastClone.querySelectorAll("img").forEach(img => {
                    img.alt = "";
                });

                track.append(firstClone);
                track.prepend(lastClone);

                let index = 1;
                let moving = false;
                let unlockTimer;
                const reducedMotion = window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                );

                function setPosition(animate = true) {
                    track.style.transition = animate && !reducedMotion.matches
                        ? "transform 0.55s cubic-bezier(0.22, 0.7, 0.25, 1)"
                        : "none";

                    track.style.transform =
                        `translateX(-${index * 100}%)`;
                }

                function realIndex() {
                    if (index === 0) return total - 1;
                    if (index === total + 1) return 0;
                    return index - 1;
                }

                function updateControls() {
                    const selected = realIndex();

                    Array.from(dotsContainer.children).forEach((dot, i) => {
                        if (i === selected) {
                            dot.setAttribute("aria-current", "true");
                        } else {
                            dot.removeAttribute("aria-current");
                        }
                    });

                    status.textContent =
                        `Image ${selected + 1} of ${total}`;
                }

                function unlock() {
                    moving = false;
                    clearTimeout(unlockTimer);
                }

                function goTo(newIndex) {
                    if (moving) return;

                    moving = true;
                    index = newIndex;

                    setPosition(true);
                    updateControls();

                    // Fallback for browsers that do not fire transitionend.
                    clearTimeout(unlockTimer);
                    unlockTimer = setTimeout(() => {
                        if (index === total + 1) {
                            index = 1;
                            setPosition(false);
                        } else if (index === 0) {
                            index = total;
                            setPosition(false);
                        }

                        unlock();
                        updateControls();
                    }, reducedMotion.matches ? 50 : 750);
                }

                function next() {
                    goTo(index + 1);
                }

                function previous() {
                    goTo(index - 1);
                }

                // Create navigation dots.
                slides.forEach((slide, i) => {
                    const dot = document.createElement("button");

                    dot.type = "button";
                    dot.setAttribute(
                        "aria-label",
                        `Show image ${i + 1} of ${total}`
                    );

                    dot.addEventListener("click", () => {
                        if (!moving) goTo(i + 1);
                    });

                    dotsContainer.append(dot);
                });

                nextButton.addEventListener("click", next);
                previousButton.addEventListener("click", previous);

                track.addEventListener("transitionend", event => {
                    if (event.propertyName !== "transform") return;

                    if (index === total + 1) {
                        index = 1;
                        setPosition(false);
                    } else if (index === 0) {
                        index = total;
                        setPosition(false);
                    }

                    unlock();
                    updateControls();
                });

                // Keyboard navigation when the slider is focused.
                slider.addEventListener("keydown", event => {
                    if (event.key === "ArrowRight") {
                        event.preventDefault();
                        next();
                    } else if (event.key === "ArrowLeft") {
                        event.preventDefault();
                        previous();
                    }
                });

                // Update position if the browser window is resized.
                window.addEventListener("resize", () => {
                    if (!moving) setPosition(false);
                });

                // Initialize the slider.
                setPosition(false);
                updateControls();
            }
        }
    }

    // ====================================
    // CONTACT FORM
    // ====================================
    const contactForm = document.querySelector("#contact-form");
    const formNote = document.querySelector("#form-note");

    if (contactForm && formNote) {
        contactForm.addEventListener("submit", event => {
            event.preventDefault();

            if (!contactForm.reportValidity()) return;

            const name = document.querySelector("#name").value.trim();
            const email = document.querySelector("#email").value.trim();
            const message = document.querySelector("#message").value.trim();

            // Replace with your real email address.
            const recipient = "your-email@example.com";

            const subject = encodeURIComponent(
                `Portfolio enquiry from ${name}`
            );

            const body = encodeURIComponent(
                `Name: ${name}\n` +
                `Email: ${email}\n\n` +
                `Message:\n${message}`
            );

            formNote.textContent =
                "Opening your email application. Send the prepared email there.";

            window.location.href =
                `mailto:${recipient}?subject=${subject}&body=${body}`;
        });
    }

    // ====================================
    // AUTOMATIC COPYRIGHT YEAR
    // ====================================
    const yearElement = document.querySelector("#year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});
