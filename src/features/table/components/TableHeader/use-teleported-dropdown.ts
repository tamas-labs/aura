import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue';

/**
 * Shared open/position/dismiss logic for a header-cell control whose panel is
 * teleported to `document.body` (to escape the `<th>`/table overflow clipping)
 * and positioned with `getBoundingClientRect()` off a toggle button.
 *
 * Extracted from `FilterDropdown` so `FilterCalendar` (and any future teleported
 * header popover) does not duplicate the position/outside-click/escape wiring.
 *
 * @param minWidth - Used only for the left/right alignment heuristic: below this
 * many pixels from the viewport's left edge, the panel opens left-aligned instead
 * of right-aligned, so it does not overflow the viewport.
 */
export const useTeleportedDropdown = (minWidth: number) => {
    const isOpen = ref(false);
    const toggleRef: Ref<HTMLElement | null> = ref(null);

    /** Fixed position coordinates for the teleported panel. */
    const dropdownPosition = ref({ top: 0, left: 0 });

    /** 'left' aligns the panel's left edge with the toggle; 'right' aligns the right edge. */
    const dropdownAlignment = ref<'left' | 'right'>('right');

    /**
     * Calculates the fixed position and alignment for the panel from the toggle
     * button's current viewport position.
     */
    const updateDropdownPosition = () => {
        if (!toggleRef.value) return;

        const rect = toggleRef.value.getBoundingClientRect();

        dropdownPosition.value.top = rect.bottom;

        if (rect.left < minWidth) {
            dropdownAlignment.value = 'left';
            dropdownPosition.value.left = rect.left;
        } else {
            dropdownAlignment.value = 'right';
            dropdownPosition.value.left = rect.right - minWidth;
        }
    };

    const toggleDropdown = () => {
        if (!isOpen.value) {
            updateDropdownPosition();
        }
        isOpen.value = !isOpen.value;
    };

    const closeDropdown = () => {
        isOpen.value = false;
    };

    /** Closes the panel when clicking outside it (the toggle button excluded). */
    const handleClickOutside = (e: MouseEvent) => {
        if (!isOpen.value) return;

        const target = e.target as Node;
        if (toggleRef.value?.contains(target)) return;

        closeDropdown();
    };

    /** Closes the panel on Escape and returns focus to the toggle button. */
    const handleKeyDown = (e: KeyboardEvent) => {
        if (isOpen.value && e.key === 'Escape') {
            closeDropdown();
            toggleRef.value?.focus();
        }
    };

    /** The panel's position goes stale on scroll/resize, so just close it. */
    const handleCloseOnEvent = () => {
        if (isOpen.value) {
            closeDropdown();
        }
    };

    onMounted(() => {
        document.addEventListener('click', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        window.addEventListener('scroll', handleCloseOnEvent, { passive: true, capture: true });
        window.addEventListener('resize', handleCloseOnEvent);
    });

    onBeforeUnmount(() => {
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('scroll', handleCloseOnEvent, true);
        window.removeEventListener('resize', handleCloseOnEvent);
    });

    return {
        isOpen,
        toggleRef,
        dropdownPosition,
        dropdownAlignment,
        toggleDropdown,
        closeDropdown,
    };
};
