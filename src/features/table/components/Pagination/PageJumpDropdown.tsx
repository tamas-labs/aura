import {
    defineComponent,
    h,
    ref,
    computed,
    watch,
    onMounted,
    onUnmounted,
    type PropType,
    nextTick,
} from 'vue';
import { useExistingCoreStore } from '../../../../state';
import { DEFAULT_STORE_ID } from '../../../../lib/default-values.lib';

/**
 * Interface for PageJumpDropdown props
 */
export interface PageJumpDropdownProps {
    storeId: string;
    currentPage: number;
    lastPage: number;
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (page: number) => void;
}

/**
 * Dropdown component to jump to a specific page
 *
 * @example
 * <PageJumpDropdown
 *   currentPage={1}
 *   lastPage={10}
 *   isOpen={isOpen}
 *   onClose={() => isOpen.value = false}
 *   onNavigate={(page) => handleNavigate(page)}
 * />
 */
export const PageJumpDropdown = defineComponent({
    name: 'PageJumpDropdown',
    props: {
        /** The table store id (source of the localized labels) */
        storeId: {
            type: String,
            default: DEFAULT_STORE_ID,
        },
        currentPage: {
            type: Number,
            required: true,
        },
        lastPage: {
            type: Number,
            required: true,
        },
        isOpen: {
            type: Boolean,
            required: true,
        },
        onClose: {
            type: Function as PropType<() => void>,
            required: true,
        },
        onNavigate: {
            type: Function as PropType<(page: number) => void>,
            required: true,
        },
    },
    setup(props) {
        const core = useExistingCoreStore(props.storeId);
        const inputRef = ref<{ focus?: () => void } | null>(null);
        const dropdownRef = ref<HTMLElement | null>(null);
        const inputValue = ref('');

        const isValid = computed(() => {
            const val = parseInt(inputValue.value, 10);
            return !isNaN(val) && val >= 1 && val <= props.lastPage && Number.isInteger(val);
        });

        const handleJump = () => {
            if (isValid.value) {
                const page = parseInt(inputValue.value, 10);
                props.onNavigate(page);
                props.onClose();
            }
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (
                props.isOpen &&
                dropdownRef.value &&
                !dropdownRef.value.contains(event.target as Node)
            ) {
                props.onClose();
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (props.isOpen && event.key === 'Escape') {
                props.onClose();
            }
            if (props.isOpen && event.key === 'Enter') {
                if (isValid.value) {
                    handleJump();
                } else {
                    event.preventDefault(); // Prevent form submission if invalid
                }
            }
        };

        watch(
            () => props.isOpen,
            async isOpen => {
                if (isOpen) {
                    inputValue.value = ''; // Reset input on open
                    await nextTick();
                    if (inputRef.value?.focus) {
                        inputRef.value.focus();
                    }
                }
            }
        );

        onMounted(() => {
            document.addEventListener('click', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        });

        onUnmounted(() => {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        });

        return () => {
            if (!props.isOpen) return null;

            const labels = core.config.labels;

            return h(
                'div',
                {
                    ref: dropdownRef,
                    class: 'dropdown-menu show p-2',
                    role: 'dialog',
                    'aria-modal': 'true',
                    'aria-label': labels.pageJump,
                    style: {
                        position: 'absolute',
                        bottom: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginBottom: '0.5rem',
                        minWidth: 'auto',
                    },
                    onClick: (e: Event) => e.stopPropagation(), // Prevent click from bubbling to parent (which might close dropdown)
                },
                [
                    h('div', { class: 'd-flex gap-2 align-items-center' }, [
                        h('input', {
                            ref: inputRef,
                            type: 'number',
                            class: 'form-control form-control-sm',
                            placeholder: labels.pageNumberPlaceholder,
                            value: inputValue.value,
                            onInput: (e: Event) => {
                                const target = e.target as unknown as { value: string };
                                inputValue.value = target.value;
                            },
                            style: {
                                width: `${Math.max(4, props.lastPage.toString().length + 2)}ch`, // Dynamic width + padding
                                minWidth: '60px',
                            },
                            'aria-label': labels.pageNumberInput,
                            min: 1,
                            max: props.lastPage,
                        }),
                        h(
                            'button',
                            {
                                class: 'btn btn-primary btn-sm',
                                disabled: !isValid.value,
                                onClick: handleJump,
                                'aria-label': labels.goToPage,
                            },
                            labels.go
                        ),
                    ]),
                ]
            );
        };
    },
});
