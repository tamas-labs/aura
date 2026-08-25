import { describe, it, expect } from 'vitest';
import type {
    ApiResponse,
    HeaderCell,
    Header,
    Body,
    Footer,
    Align,
    Size,
    BootstrapColor,
    CellType,
    StaticConfig,
    IconConfig,
    LinkConfig,
    ModalConfig,
    BadgeConfig,
    ProgressConfig,
    ButtonConfig,
    CustomConfig,
    ReferenceConfig,
    ColumnConfig,
    PaginationMeta,
    PaginationLinks,
    ConditionalConfig,
    CellRules,
} from '../api-response.types';

describe('ApiResponse Type Tests', () => {
    describe('Literal Union Types', () => {
        it('should accept valid Align values', () => {
            const alignStart: Align = 'start';
            const alignCenter: Align = 'center';
            const alignEnd: Align = 'end';

            expect(alignStart).toBe('start');
            expect(alignCenter).toBe('center');
            expect(alignEnd).toBe('end');
        });

        it('should accept valid Size values', () => {
            const sizes: Size[] = ['xs', 'sm', 'md', 'lg', 'xl'];
            expect(sizes).toHaveLength(5);
        });

        it('should accept valid BootstrapColor values', () => {
            const colors: BootstrapColor[] = [
                'primary',
                'secondary',
                'success',
                'danger',
                'warning',
                'info',
                'dark',
                'light',
            ];
            expect(colors).toHaveLength(8);
        });

        it('should accept valid CellType values', () => {
            const types: CellType[] = [
                'number',
                'currency',
                'date',
                'phone',
                'time',
                'static',
                'icon',
                'link',
                'modal',
                'reference',
                'badge',
                'progress',
                'button',
                'custom',
            ];
            expect(types).toHaveLength(14);
        });
    });

    describe('HeaderCell Interface', () => {
        it('should create valid HeaderCell with required fields', () => {
            const cell: HeaderCell = {
                content: 'User ID',
                key: 'id',
                field: 'id',
            };

            expect(cell.content).toBe('User ID');
            expect(cell.key).toBe('id');
            expect(cell.field).toBe('id');
        });

        it('should create HeaderCell with fields array instead of field', () => {
            const cell: HeaderCell = {
                content: 'Full Name',
                key: 'fullname',
                fields: ['firstName', 'lastName'],
            };

            expect(cell.fields).toEqual(['firstName', 'lastName']);
            expect(cell.field).toBeUndefined();
        });

        it('should create HeaderCell with all formatting options', () => {
            const cell: HeaderCell = {
                content: 'Price',
                key: 'price',
                field: 'price',
                sortable: true,
                align: 'end',
                width: '100px',
                color: 'success',
                fontWeight: 'bold',
                type: 'currency',
            };

            expect(cell.align).toBe('end');
            expect(cell.width).toBe('100px');
            expect(cell.sortable).toBe(true);
        });

        it('should create HeaderCell with data attributes', () => {
            const cell: HeaderCell = {
                content: 'Status',
                key: 'status',
                field: 'status',
                'data-tooltip': 'User status',
                'data-track-id': 'status-column',
            };

            expect(cell['data-tooltip']).toBe('User status');
            expect(cell['data-track-id']).toBe('status-column');
        });

        it('should create HeaderCell with nullable fields', () => {
            const cell: HeaderCell = {
                content: 'Optional',
                key: 'opt',
                label: null,
                color: null,
                width: null,
            };

            expect(cell.label).toBeNull();
            expect(cell.color).toBeNull();
        });
    });

    describe('Header Interface', () => {
        it('should create valid Header with rows', () => {
            const header: Header = {
                rows: [
                    {
                        cells: [
                            { content: 'ID', key: 'id', field: 'id' },
                            { content: 'Name', key: 'name', field: 'name' },
                        ],
                    },
                ],
            };

            expect(header.rows).toHaveLength(1);
            expect(header.rows![0]!.cells).toHaveLength(2);
        });

        it('should create Header with settings', () => {
            const header: Header = {
                rows: [{ cells: [] }],
                settings: {
                    sticky: true,
                    height: '60px',
                },
            };

            expect(header.settings?.sticky).toBe(true);
            expect(header.settings?.height).toBe('60px');
        });

        it('should allow additional properties in Header', () => {
            const header: Header = {
                rows: [],
                customProp: 'custom value',
            };

            expect(header.customProp).toBe('custom value');
        });
    });

    describe('Column Config Types', () => {
        it('should create valid StaticConfig', () => {
            const config: StaticConfig = {
                type: 'static',
                value: 'Fixed Text',
                unit: 'kg',
                uppercase: true,
                key: 'id',
            };

            expect(config.type).toBe('static');
            expect(config.value).toBe('Fixed Text');
            expect(config.unit).toBe('kg');
        });

        it('should accept StaticConfig with formatting fields', () => {
            const config: StaticConfig = {
                type: 'static',
                value: 'active',
                color: 'success',
                align: 'end',
                class: ['badge'],
            };

            expect(config.color).toBe('success');
            expect(config.align).toBe('end');
            expect(config.class).toEqual(['badge']);
        });

        it('should accept StaticConfig with slice field', () => {
            const config: StaticConfig = {
                type: 'static',
                value: 'This is a very long disclaimer text that needs to be truncated',
                slice: 25,
                class: ['text-muted', 'small'],
            };

            expect(config.slice).toBe(25);
        });

        it('should accept StaticConfig with special formatting fields', () => {
            const config: StaticConfig = {
                type: 'static',
                value: '1000',
                number: true,
                currency: true,
                date: false,
                phone: false,
            };

            expect(config.number).toBe(true);
            expect(config.currency).toBe(true);
            expect(config.date).toBe(false);
            expect(config.phone).toBe(false);
        });

        it('should accept StaticConfig with padding fields', () => {
            const config: StaticConfig = {
                type: 'static',
                value: '42',
                padStart: 5,
                padEnd: 3,
                chars: '0',
            };

            expect(config.padStart).toBe(5);
            expect(config.padEnd).toBe(3);
            expect(config.chars).toBe('0');
        });

        it('should accept StaticConfig with nullable fields', () => {
            const config: StaticConfig = {
                type: 'static',
                value: 'Test',
                color: null,
                align: null,
                slice: null,
                number: null,
                currency: null,
                date: null,
                phone: null,
                padStart: null,
                padEnd: null,
                chars: null,
            };

            expect(config.color).toBeNull();
            expect(config.align).toBeNull();
            expect(config.slice).toBeNull();
        });

        it('should accept StaticConfig with content manipulation fields', () => {
            const config: StaticConfig = {
                type: 'static',
                value: 'electronics and gadgets',
                lowercase: true,
                capitalize: false,
                monospace: false,
                uppercase: false,
            };

            expect(config.lowercase).toBe(true);
            expect(config.capitalize).toBe(false);
            expect(config.monospace).toBe(false);
            expect(config.uppercase).toBe(false);
        });

        it('should accept all valid align values', () => {
            const configStart: StaticConfig = { type: 'static', value: 'v', align: 'start' };
            const configCenter: StaticConfig = { type: 'static', value: 'v', align: 'center' };
            const configEnd: StaticConfig = { type: 'static', value: 'v', align: 'end' };

            expect(configStart.align).toBe('start');
            expect(configCenter.align).toBe('center');
            expect(configEnd.align).toBe('end');
        });

        it('should accept all valid Bootstrap color values on StaticConfig', () => {
            const config: StaticConfig = { type: 'static', value: 'active', color: 'danger' };
            const config2: StaticConfig = { type: 'static', value: 'warn', color: 'warning' };
            const config3: StaticConfig = { type: 'static', value: 'info', color: 'info' };

            expect(config.color).toBe('danger');
            expect(config2.color).toBe('warning');
            expect(config3.color).toBe('info');
        });

        it('should accept StaticConfig with combined fields', () => {
            const config: StaticConfig = {
                type: 'static',
                value: '42',
                number: true,
                padStart: 5,
                chars: '0',
                class: 'font-monospace',
            };

            expect(config.type).toBe('static');
            expect(config.value).toBe('42');
            expect(config.number).toBe(true);
            expect(config.padStart).toBe(5);
            expect(config.chars).toBe('0');
            expect(config.class).toBe('font-monospace');
        });

        it('should create valid IconConfig', () => {
            const config: IconConfig = {
                type: 'icon',
                icon: 'fa-user',
                variant: 'primary',
                size: 'lg',
                route: '/users/{id}',
                key: 'id',
            };

            expect(config.type).toBe('icon');
            expect(config.icon).toBe('fa-user');
            expect(config.variant).toBe('primary');
        });

        it('should create valid LinkConfig', () => {
            const config: LinkConfig = {
                type: 'link',
                route: '/users/{id}/edit',
                target: '_blank',
                field: 'name',
                key: 'id',
            };

            expect(config.type).toBe('link');
            expect(config.target).toBe('_blank');
        });

        it('should create valid ModalConfig', () => {
            const config: ModalConfig = {
                type: 'modal',
                id: 'deleteModal',
                route: '/api/users/{id}',
                key: 'id',
                content: {
                    type: 'icon',
                    icon: 'fa-trash',
                    variant: 'danger',
                },
            };

            expect(config.type).toBe('modal');
            expect(config.id).toBe('deleteModal');
            expect(config.content?.type).toBe('icon');
        });

        it('should create valid BadgeConfig with mapping', () => {
            const config: BadgeConfig = {
                type: 'badge',
                variant: 'success',
                pill: true,
                mapping: {
                    active: { variant: 'success', label: 'Active' },
                    inactive: { variant: 'secondary', label: 'Inactive' },
                },
                icon: 'fa-circle',
                iconPosition: 'start',
            };

            expect(config.type).toBe('badge');
            expect(config.mapping!.active!.variant).toBe('success');
        });

        it('should create valid ProgressConfig', () => {
            const config: ProgressConfig = {
                type: 'progress',
                max: 100,
                variant: 'info',
                striped: true,
                animated: true,
                label: '{value}%',
                labelPosition: 'inside',
                thresholds: {
                    success: [0, 50],
                    warning: [51, 80],
                    danger: [81, 100],
                },
            };

            expect(config.type).toBe('progress');
            expect(config.striped).toBe(true);
        });

        it('should create valid ButtonConfig', () => {
            const config: ButtonConfig = {
                type: 'button',
                variant: 'primary',
                route: '/users/{id}',
                icon: 'fa-edit',
                iconPosition: 'start',
                rounded: true,
                key: 'id',
            };

            expect(config.type).toBe('button');
            expect(config.variant).toBe('primary');
        });

        it('should create valid CustomConfig', () => {
            const config: CustomConfig = {
                type: 'custom',
                renderer: 'myRenderer',
                callback: 'myCallback',
                template: '<div>{value}</div>',
                params: { color: 'red' },
                key: 'id',
            };

            expect(config.type).toBe('custom');
            expect(config.renderer).toBe('myRenderer');
        });

        it('should create valid ReferenceConfig', () => {
            const config: ReferenceConfig = {
                type: 'reference',
                field: 'username',
                separator: ', ',
            };

            expect(config.type).toBe('reference');
            expect(config.separator).toBe(', ');
        });

        it('should accept ColumnConfig union type', () => {
            const configs: ColumnConfig[] = [
                { type: 'static', value: 'Test' },
                { type: 'icon', icon: 'fa-user' },
                { type: 'link', route: '/test' },
                { type: 'badge', variant: 'primary' },
            ];

            expect(configs).toHaveLength(4);
            expect(configs[0]!.type).toBe('static');
            expect(configs[1]!.type).toBe('icon');
        });
    });

    describe('Body Interface', () => {
        it('should create valid Body with columnConfigs', () => {
            const body: Body = {
                columnConfigs: {
                    status: {
                        type: 'badge',
                        variant: 'success',
                        mapping: {
                            active: { variant: 'success', label: 'Active' },
                        },
                    },
                    actions: {
                        type: 'icon',
                        icon: 'fa-edit',
                    },
                },
                settings: {
                    striped: true,
                    hoverable: true,
                },
            };

            expect(body.columnConfigs!.status!.type).toBe('badge');
            expect(body.settings?.striped).toBe(true);
        });

        it('should create Body with columnStyles', () => {
            const body: Body = {
                columnStyles: {
                    name: 'text-bold',
                    email: ['text-muted', 'small'],
                },
            };

            expect(body.columnStyles?.name).toBe('text-bold');
            expect(body.columnStyles?.email).toEqual(['text-muted', 'small']);
        });

        it('should create Body with rowRules', () => {
            const body: Body = {
                rowRules: {
                    key: 'status',
                    if: [
                        {
                            operator: 'eq',
                            value: 'deleted',
                            background: 'danger',
                            opacity: 0.5,
                        },
                    ],
                    else: null,
                },
            };

            expect(body.rowRules?.key).toBe('status');
        });

        it('should create Body with cellRules on columnConfigs entry', () => {
            const body: Body = {
                columnConfigs: {
                    price: {
                        type: 'static',
                        value: '',
                        cellRules: {
                            key: 'price',
                            if: [
                                {
                                    operator: 'gt',
                                    value: 1000,
                                    color: 'success',
                                    background: 'light',
                                },
                            ],
                        },
                    },
                },
            };

            expect(body.columnConfigs!.price!.cellRules!.key).toBe('price');
        });
    });

    describe('Footer Interface', () => {
        it('should create valid Footer', () => {
            const footer: Footer = {
                rows: [
                    {
                        cells: [{ content: 'Total', key: 'total', field: 'total' }],
                    },
                ],
                settings: {
                    sticky: true,
                    height: '50px',
                },
            };

            expect(footer.rows).toHaveLength(1);
            expect(footer.settings?.sticky).toBe(true);
        });
    });

    describe('Pagination Interfaces', () => {
        it('should create valid PaginationMeta', () => {
            const meta: PaginationMeta = {
                current_page: 1,
                from: 1,
                last_page: 10,
                path: 'http://example.com/api/users',
                per_page: 15,
                to: 15,
                total: 150,
            };

            expect(meta.current_page).toBe(1);
            expect(meta.total).toBe(150);
        });

        it('should create PaginationMeta with null values', () => {
            const meta: PaginationMeta = {
                current_page: 1,
                from: null,
                last_page: 1,
                path: 'http://example.com',
                per_page: 10,
                to: null,
                total: 0,
            };

            expect(meta.from).toBeNull();
            expect(meta.to).toBeNull();
        });

        it('should create valid PaginationLinks', () => {
            const links: PaginationLinks = {
                first: 'http://example.com?page=1',
                last: 'http://example.com?page=10',
                prev: null,
                next: 'http://example.com?page=2',
            };

            expect(links.first).toBe('http://example.com?page=1');
            expect(links.prev).toBeNull();
        });
    });

    describe('Conditional Rendering', () => {
        it('should create valid ConditionalConfig', () => {
            const config: ConditionalConfig = {
                key: 'status',
                if: [
                    {
                        operator: 'eq',
                        value: 'active',
                        config: { color: 'success' },
                    },
                ],
                else: { color: 'secondary' },
            };

            expect(config.key).toBe('status');
            expect(config.if).toHaveLength(1);
        });

        it('should create CellRules with conditional formatting', () => {
            const rules: CellRules = {
                key: 'amount',
                background: 'light',
                if: [
                    {
                        operator: 'gt',
                        value: 1000,
                        color: 'success',
                        background: 'success',
                    },
                ],
                else: {
                    color: 'danger',
                },
            };

            expect(rules.key).toBe('amount');
            expect(rules.background).toBe('light');
        });
    });

    describe('Complete ApiResponse', () => {
        it('should create complete ApiResponse with all sections', () => {
            const response: ApiResponse = {
                header: {
                    rows: [
                        {
                            cells: [
                                {
                                    content: 'ID',
                                    key: 'id',
                                    field: 'id',
                                    sortable: true,
                                    width: '50px',
                                },
                                {
                                    content: 'Name',
                                    key: 'name',
                                    field: 'name',
                                    sortable: true,
                                    searchable: true,
                                },
                            ],
                        },
                    ],
                    settings: {
                        sticky: true,
                        height: 'auto',
                    },
                },
                body: {
                    columnConfigs: {
                        status: {
                            type: 'badge',
                            variant: 'success',
                        },
                    },
                    settings: {
                        striped: true,
                        hoverable: true,
                    },
                },
                footer: {
                    rows: [
                        {
                            cells: [{ content: 'Total', key: 'total', field: 'total' }],
                        },
                    ],
                },
                items: [
                    { id: 1, name: 'John Doe', status: 'active' },
                    { id: 2, name: 'Jane Doe', status: 'inactive' },
                ],
                meta: {
                    current_page: 1,
                    from: 1,
                    last_page: 10,
                    path: 'http://example.com',
                    per_page: 15,
                    to: 15,
                    total: 150,
                },
                links: {
                    first: 'http://example.com?page=1',
                    last: 'http://example.com?page=10',
                    prev: null,
                    next: 'http://example.com?page=2',
                },
            };

            expect(response).toBeDefined();
            expect(response.header?.rows).toHaveLength(1);
            expect(response.body!.columnConfigs!.status!.type).toBe('badge');
            expect(response.items).toHaveLength(2);
            expect(response.meta?.current_page).toBe(1);
            expect(response.links?.first).toBe('http://example.com?page=1');
        });

        it('should create minimal ApiResponse', () => {
            const response: ApiResponse = {
                items: [],
            };

            expect(response.items).toEqual([]);
            expect(response.header).toBeUndefined();
        });

        it('should create ApiResponse with Laravel pagination only', () => {
            const response: ApiResponse = {
                items: [{ id: 1, name: 'Test' }],
                meta: {
                    current_page: 1,
                    from: 1,
                    last_page: 5,
                    path: 'http://test.com',
                    per_page: 20,
                    to: 20,
                    total: 100,
                },
                links: {
                    first: 'http://test.com?page=1',
                    last: 'http://test.com?page=5',
                    prev: null,
                    next: 'http://test.com?page=2',
                },
            };

            expect(response.meta?.current_page).toBe(1);
            expect(response.links?.next).toBe('http://test.com?page=2');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty objects', () => {
            const response: ApiResponse = {};
            expect(response).toBeDefined();
        });

        it('should handle null values in nullable fields', () => {
            const header: Header = {
                rows: [
                    {
                        cells: [
                            {
                                content: 'Test',
                                key: 'test',
                                label: null,
                                width: null,
                                color: null,
                            },
                        ],
                    },
                ],
                settings: null,
            };

            expect(header.settings).toBeNull();
            expect(header.rows![0]!.cells![0]!.label).toBeNull();
        });

        it('should handle complex nested structures', () => {
            const response: ApiResponse = {
                body: {
                    columnConfigs: {
                        actions: {
                            type: 'modal',
                            id: 'deleteModal',
                            route: '/api/delete/{id}',
                            content: {
                                type: 'button',
                                variant: 'danger',
                                icon: 'fa-trash',
                                value: 'Delete',
                            },
                        },
                        status: {
                            type: 'static',
                            value: '',
                            cellRules: {
                                key: 'status',
                                if: [
                                    {
                                        operator: 'in',
                                        value: ['active', 'pending'],
                                        background: 'success',
                                        color: 'white',
                                    },
                                    {
                                        operator: 'eq',
                                        value: 'deleted',
                                        background: 'danger',
                                        opacity: 0.5,
                                    },
                                ],
                                else: {
                                    background: 'light',
                                },
                            },
                        },
                    },
                },
            };

            expect(response.body!.columnConfigs!.actions!.type).toBe('modal');
            expect(response.body!.columnConfigs!.status!.cellRules!.if).toHaveLength(2);
        });
    });
});
