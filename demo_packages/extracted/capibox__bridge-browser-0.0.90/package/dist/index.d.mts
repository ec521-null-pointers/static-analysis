interface components {
    schemas: {
        CreateLinkDto: {
            /** @example Documentation Page */
            title: string;
            /** @example https://example.com/page */
            url: string;
            /** @example true */
            active?: boolean;
            /** @example en */
            language: string;
            /** @example Google Drive */
            source: string;
            /** @example Project Alpha */
            project: string;
        };
        LinkResponseDto: {
            /** @description Link ID */
            id: number;
            /** @description Link title */
            title: string;
            /** @description Target URL */
            url: string;
            /** @description Whether the link is active */
            active: boolean;
            /** @description Language of the account */
            language: string;
            /** @description Source of the link (e.g., google, facebook) */
            source: string;
            /** @description Project this link belongs to */
            project: string;
            /** @description Spreadsheet URL if applicable */
            spreadsheet_url?: string;
        };
        UpdateLinkDto: {
            /** @example Documentation Page */
            title?: string;
            /** @example https://example.com/page */
            url?: string;
            /** @example true */
            active?: boolean;
            /** @example en */
            language?: string;
            /** @example Google Drive */
            source?: string;
            /** @example Project Alpha */
            project?: string;
        };
        CreateLanguageRuleDto: {
            /** @example 1 */
            accountId: number;
            /** @example Greeting Rule */
            title: string;
            /** @example en */
            language: string;
            /**
             * @example contains
             * @enum {string}
             */
            condition_type: "contains" | "equals" | "not_contains";
            /** @example hello */
            condition_value: string;
            /** @example 1 */
            sort?: number;
        };
        LanguageRuleAccountDto: {
            /** @description Account ID (Link ID) */
            id: number;
            /** @description Account source */
            source: string;
            /** @description Account language */
            language: string;
        };
        LanguageRuleResponseDto: {
            /** @description Rule ID */
            id: number;
            /** @description Condition type (contains, equals) */
            condition_type: string;
            /** @description Condition value (string to match against campaign name) */
            condition_value: string;
            /** @description Language code to assign if matched */
            language: string;
            /** @description Sort order */
            sort: number;
            /** @description Associated account (Link) */
            account?: components["schemas"]["LanguageRuleAccountDto"];
        };
        UpdateLanguageRuleDto: {
            /** @example 1 */
            accountId?: number;
            /** @example Greeting Rule */
            title?: string;
            /** @example en */
            language?: string;
            /**
             * @example contains
             * @enum {string}
             */
            condition_type?: "contains" | "equals" | "not_contains";
            /** @example hello */
            condition_value?: string;
            /** @example 1 */
            sort?: number;
        };
        AdSpendAccountDto: {
            /** @description Account (Link) ID */
            id: number;
            /** @description Account source */
            source: string;
            /** @description Account language */
            language: string;
        };
        AdSpendResponseDto: {
            /** @description AdSpend record ID */
            id: number;
            /** @description Spend date (YYYY-MM-DD) */
            date: string;
            /** @description Country (mapped from country code) */
            country: string;
            /** @description Language code applied */
            language: string;
            /** @description Spend amount in account currency */
            spend: number;
            /** @description Associated account (Link) */
            account?: components["schemas"]["AdSpendAccountDto"];
        };
        AdSpendPaginatedResponseDto: {
            data: components["schemas"]["AdSpendResponseDto"][];
            /** @example 100 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 10 */
            totalPages: number;
        };
        AdSpendDataForErpDto: {
            /**
             * @description Nested object with three levels of string keys and number values
             * @example {
             *       "account1": {
             *         "campaign1": {
             *           "metric1": 100,
             *           "metric2": 200
             *         }
             *       }
             *     }
             */
            data: Record<string, never>;
        };
        TeamResponseDto: {
            /**
             * @description The unique identifier of the team
             * @example 1
             */
            id: number;
            /**
             * @description The title of the team
             * @example Development Team
             */
            title: string;
            /**
             * @description The access for element
             * @example [
             *       "xx@netzet.com",
             *       "xx2@netzet.com"
             *     ]
             */
            access?: string[];
        };
        ProjectGroupResponseDto: {
            /**
             * @description The unique identifier of the project group
             * @example 1
             */
            id: number;
            /**
             * @description The title of the project group
             * @example Frontend Projects
             */
            title: string;
            /**
             * @description The ID of the team this project group belongs to
             * @example 1
             */
            teamId: number;
            /** @description The team this project group belongs to */
            team: components["schemas"]["TeamResponseDto"];
            /**
             * @description The access for element
             * @example [
             *       "xx@netzet.com",
             *       "xx2@netzet.com"
             *     ]
             */
            access?: string[];
        };
        ProjectResponseDto: {
            /**
             * @description The unique identifier of the project
             * @example 1
             */
            id: number;
            /**
             * @description The title of the project
             * @example My Awesome Project
             */
            title: string;
            /**
             * @description The unique UUID of the project used for authentication
             * @example 123e4567-e89b-12d3-a456-426614174000
             */
            uuid: string;
            /**
             * @description The unique UUID for development purposes
             * @example 123e4567-e89b-12d3-a456-426614174001
             */
            uuidDev?: string;
            /**
             * @description The URL of the project
             * @example https://myproject.example.com
             */
            url: string;
            /**
             * @description The support email address for the project
             * @example support@example.com
             */
            support_email: string;
            /**
             * @description Project language
             * @example en
             */
            language?: string;
            /**
             * @description The slug of the project
             * @example my-awesome-project
             */
            slug: string;
            groupId?: number;
            teamId?: number;
            team?: components["schemas"]["TeamResponseDto"];
            group?: components["schemas"]["ProjectGroupResponseDto"];
            /**
             * @description The access for element
             * @example [
             *       "xx@netzet.com",
             *       "xx2@netzet.com"
             *     ]
             */
            access?: string[];
        };
        CreateProjectDto: {
            /**
             * @description The title of the project
             * @example My Awesome Project
             */
            title: string;
            /**
             * @description The URL of the project
             * @example https://myproject.example.com
             */
            url: string;
            /**
             * @description The support email address for the project
             * @example support@example.com
             */
            support_email?: string;
            /**
             * @description Project language
             * @example en
             */
            language?: string;
            /**
             * @description The slug of the project
             * @example my-awesome-project
             */
            slug: string;
            groupId?: number;
            teamId?: number;
            /**
             * @description The access for element
             * @example [
             *       "xx@netzet.com",
             *       "xx2@netzet.com"
             *     ]
             */
            access?: string[];
        };
        UpdateProjectDto: {
            /**
             * @description The title of the project
             * @example My Awesome Project
             */
            title?: string;
            /**
             * @description The URL of the project
             * @example https://myproject.example.com
             */
            url?: string;
            /**
             * @description The support email address for the project
             * @example support@example.com
             */
            support_email?: string;
            /**
             * @description Project language
             * @example en
             */
            language?: string;
            /**
             * @description The slug of the project
             * @example my-awesome-project
             */
            slug?: string;
            groupId?: number;
            teamId?: number;
            /**
             * @description The access for element
             * @example [
             *       "xx@netzet.com",
             *       "xx2@netzet.com"
             *     ]
             */
            access?: string[];
        };
        CreateTeamDto: {
            /**
             * @description The title of the team
             * @example Development Team
             */
            title: string;
            /**
             * @description The access for element
             * @example [
             *       "xx@netzet.com",
             *       "xx2@netzet.com"
             *     ]
             */
            access?: string[];
        };
        UpdateTeamDto: {
            /**
             * @description The title of the team
             * @example Development Team
             */
            title?: string;
            /**
             * @description The access for element
             * @example [
             *       "xx@netzet.com",
             *       "xx2@netzet.com"
             *     ]
             */
            access?: string[];
        };
        CreateProjectGroupDto: {
            /**
             * @description The title of the project group
             * @example Frontend Projects
             */
            title: string;
            /**
             * @description The ID of the team this project group belongs to
             * @example 1
             */
            teamId: number;
            /**
             * @description The access for element
             * @example [
             *       "xx@netzet.com",
             *       "xx2@netzet.com"
             *     ]
             */
            access?: string[];
        };
        UpdateProjectGroupDto: {
            /**
             * @description The title of the project group
             * @example Frontend Projects
             */
            title?: string;
            /**
             * @description The ID of the team this project group belongs to
             * @example 1
             */
            teamId?: number;
            /**
             * @description The access for element
             * @example [
             *       "xx@netzet.com",
             *       "xx2@netzet.com"
             *     ]
             */
            access?: string[];
        };
        IntegrationResponseDto: {
            /**
             * @description The unique identifier of the integration
             * @example 1
             */
            id: number;
            /**
             * @description The title of the integration
             * @example My Facebook Integration
             */
            title: string;
            /**
             * @description The ID of the project this integration belongs to
             * @example 1
             */
            projectId: number;
            /**
             * @description The type of integration
             * @example facebook
             */
            type: string;
            /**
             * @description The URL for the integration
             * @example https://example.com/api
             */
            url: string;
            /**
             * @description Additional options for the integration
             * @example {
             *       "apiKey": "abc123",
             *       "enabled": true
             *     }
             */
            options?: Record<string, never>;
            /** @description The project this integration belongs to */
            project?: components["schemas"]["ProjectResponseDto"];
            /**
             * @description The access for element
             * @example [
             *       "xx@netzet.com",
             *       "xx2@netzet.com"
             *     ]
             */
            access?: string[];
            /**
             * @description Swagger tag
             * @example facebook
             */
            tag: string;
            /**
             * @description Swagger type
             * @enum {string}
             */
            swagger_type: "" | "public" | "crm";
        };
        CreateIntegrationDto: {
            /**
             * @description The type of integration
             * @example facebook
             */
            type: string;
            /**
             * @description The title of the integration
             * @example My Facebook Integration
             */
            title: string;
            /**
             * @description The ID of the project this integration belongs to
             * @example 1
             */
            projectId: number;
            /**
             * @description Additional options for the integration
             * @example {
             *       "apiKey": "abc123",
             *       "enabled": true
             *     }
             */
            options?: Record<string, never>;
            /**
             * @description The URL for the integration
             * @example https://example.com/api
             */
            url?: string;
            /**
             * @description The access for element
             * @example [
             *       "xx@netzet.com",
             *       "xx2@netzet.com"
             *     ]
             */
            access?: string[];
            /**
             * @description Swagger tag
             * @example facebook
             */
            tag: string;
            /**
             * @description Swagger type
             * @enum {string}
             */
            swagger_type: "" | "public" | "crm";
        };
        UpdateIntegrationDto: {
            /**
             * @description The title of the integration
             * @example Updated Facebook Integration
             */
            title?: string;
            /**
             * @description The ID of the project this integration belongs to
             * @example 1
             */
            projectId?: number;
            /**
             * @description The type of integration
             * @example facebook
             */
            type?: string;
            /**
             * @description The URL for the integration
             * @example https://example.com/api
             */
            url?: string;
            /**
             * @description Description of the integration
             * @example This is a Facebook integration for our project
             */
            _description?: string;
            /**
             * @description Additional options for the integration
             * @example {
             *       "apiKey": "abc123",
             *       "enabled": true
             *     }
             */
            options?: Record<string, never>;
            /**
             * @description The access for element
             * @example [
             *       "xx@netzet.com",
             *       "xx2@netzet.com"
             *     ]
             */
            access?: string[];
            /**
             * @description Swagger tag
             * @example facebook
             */
            tag: string;
            /**
             * @description Swagger type
             * @enum {string}
             */
            swagger_type: "" | "public" | "crm";
        };
        AllIntegrationsResponseDto: {
            granted: components["schemas"]["IntegrationResponseDto"][];
            other: components["schemas"]["IntegrationResponseDto"][];
        };
        FunnelTemplatesEnumDto: {
            /**
             * @example [
             *       "hp_default",
             *       "hp_longform"
             *     ]
             */
            homePageTemplate: string[];
            /**
             * @example [
             *       "quiz_v1",
             *       "quiz_v2"
             *     ]
             */
            quizPageTemplate: string[];
            /**
             * @example [
             *       "result_basic",
             *       "result_pro"
             *     ]
             */
            resultPageTemplate: string[];
            /**
             * @example [
             *       "email_capture_simple",
             *       "email_capture_2step"
             *     ]
             */
            emailPageTemplate: string[];
            /**
             * @example [
             *       "checkout_onepage",
             *       "checkout_two_step"
             *     ]
             */
            checkoutPageTemplate: string[];
            /**
             * @example [
             *       "upsell_inline",
             *       "upsell_popup"
             *     ]
             */
            upsellPageTemplate: string[];
            /**
             * @example [
             *       "payment_sidecar",
             *       "payment_modal"
             *     ]
             */
            paymentWindowTemplate: string[];
            /**
             * @example [
             *       "thankyou_basic",
             *       "thankyou_with_survey"
             *     ]
             */
            thankyouPageTemplate: string[];
        };
        FunnelTemplatesEnumResponseDto: {
            /** @example true */
            success: boolean;
            data: components["schemas"]["FunnelTemplatesEnumDto"];
        };
        FunnelResponseDto: {
            /**
             * @description Unique identifier for the funnel
             * @example 1
             */
            id: number;
            /**
             * @description Project name associated with the funnel
             * @example E-commerce Funnel
             */
            project: string;
            /**
             * @description Landing angle for the funnel
             * @example Discount Offer
             */
            angle: string;
            /**
             * @description Version of the funnel
             * @example v1.0
             */
            version: string;
            /**
             * @description Additional notes for the funnel
             * @example Black Friday Sale Funnel
             */
            note?: string;
            /**
             * @description Template for the home page
             * @example HomePageTemplate_v1
             */
            home_page?: string;
            /**
             * @description Template for the quiz page
             * @example QuizPage_v1
             */
            quiz_page?: string;
            /**
             * @description Template for the results page
             * @example ResultsPage_v1
             */
            results_page?: string;
            /**
             * @description Template for the email page
             * @example EmailPage_v1
             */
            email_page?: string;
            /**
             * @description Template for the checkout page
             * @example CheckoutPage_v1
             */
            checkout_page?: string;
            /**
             * @description Template for the payment window
             * @example PaymentWindow_v1
             */
            payment_window?: string;
            /**
             * @description Template for the upsell page
             * @example UpsellPage_v1
             */
            upsell_page: string;
            /**
             * @description Options for the upsell
             * @example {
             *       "option1": "Buy 1 Get 1 Free"
             *     }
             */
            upsell_options?: {
                [key: string]: unknown;
            };
            /**
             * @description Additional options for the funnel
             * @example {
             *       "color": "blue"
             *     }
             */
            options?: Record<string, never>;
            /**
             * @description Template for the thank you page
             * @example ThankYouPage_v1
             */
            thankyou_page_template?: string;
        };
        CreateFunnelDtoBridge: {
            /** @example weight-loss-women-40+ */
            angle: string;
            /** @example v3 */
            version: string;
            /** @example Initial rollout for ES market */
            note?: string;
            /** @example hp_default */
            home_page?: string;
            /** @example quiz_v2 */
            quiz_page?: string;
            /** @example result_pro */
            results_page?: string;
            /** @example email_capture_2step */
            email_page?: string;
            /** @example checkout_two_step */
            checkout_page?: string;
            /** @example payment_modal */
            payment_window?: string;
            /** @example upsell_inline */
            upsell_page: string;
            /** @example thankyou_basic */
            thankyou_page_template?: string;
            /**
             * @example {
             *       "offerA": true,
             *       "bump": "shipping-insurance"
             *     }
             */
            upsell_options?: Record<string, never>;
            /**
             * @example {
             *       "locale": "es-ES",
             *       "currency": "EUR"
             *     }
             */
            options?: Record<string, never>;
        };
        UpdateFunnelDto: {
            /** @example Conversion Funnel */
            funnel?: string;
            /**
             * @description Attribute IDs
             * @example [
             *       1,
             *       2
             *     ]
             */
            attributeIds?: string[];
        };
        SplitItemDto: {
            /**
             * @description The split url (mapped to url in entity)
             * @example https://example.com/split1
             */
            url: string;
            /**
             * @description The percentage or weight for this split (mapped to split in entity)
             * @example 50
             */
            split: number;
        };
        SplitResponseDto: {
            /**
             * @description The ID of the split
             * @example 1
             */
            id: number;
            /**
             * @description The project associated with this split
             * @example Project ABC
             */
            project: string;
            /**
             * @description The URL associated with this split
             * @example https://example.com/split
             */
            url?: string;
            /**
             * @description List of split items for this project
             * @example [
             *       {
             *         "name": "Split A",
             *         "weight": 50
             *       },
             *       {
             *         "name": "Split B",
             *         "weight": 50
             *       }
             *     ]
             */
            splits?: components["schemas"]["SplitItemDto"][];
            /**
             * @description Additional options related to the split
             * @example {
             *       "key": "value"
             *     }
             */
            options?: {
                [key: string]: unknown;
            };
            /**
             * @description Whether the split is active or not
             * @example true
             */
            active: boolean;
        };
        CreateSplitDto: {
            /**
             * @description The project name
             * @example Project ABC
             */
            project: string;
            /**
             * @description The URL associated with the split
             * @example https://example.com/split
             */
            url: string;
            /**
             * @description List of split items for this project
             * @example [
             *       {
             *         "name": "Split A",
             *         "weight": 50
             *       },
             *       {
             *         "name": "Split B",
             *         "weight": 50
             *       }
             *     ]
             */
            splits?: components["schemas"]["SplitItemDto"][];
            /**
             * @description Additional options related to the split
             * @example {
             *       "key": "value"
             *     }
             */
            options?: {
                [key: string]: unknown;
            };
            /**
             * @description Whether the split is active or not
             * @example true
             */
            active: boolean;
        };
        UpdateSplitDto: {
            /**
             * @description The project name (optional for update)
             * @example Project ABC
             */
            project?: string;
            /**
             * @description The URL associated with the split (optional for update)
             * @example https://example.com/split
             */
            url?: string;
            /**
             * @description List of split items for this project (optional for update)
             * @example [
             *       {
             *         "name": "Split A",
             *         "weight": 50
             *       },
             *       {
             *         "name": "Split B",
             *         "weight": 50
             *       }
             *     ]
             */
            splits?: components["schemas"]["SplitItemDto"][];
            /**
             * @description Additional options related to the split (optional for update)
             * @example {
             *       "key": "value"
             *     }
             */
            options?: {
                [key: string]: unknown;
            };
            /**
             * @description Whether the split is active or not (optional for update)
             * @example true
             */
            active?: boolean;
        };
        SendMailToRecipientDto: {
            /**
             * @description Email recipient address
             * @example recipient@example.com
             */
            to: string;
            /**
             * @description Email subject
             * @example Important information about your account
             */
            subject: string;
            /**
             * @description HTML content of the email
             * @example <p>Hello, this is an <strong>important</strong> message.</p>
             */
            htmlPart?: string;
            /**
             * @description Plain text content of the email
             * @example Hello, this is an important message.
             */
            textPart?: string;
        };
        SendMailResponseDto: {
            /**
             * @description Success status
             * @example true
             */
            success: boolean;
        };
        SendMailToSupportDto: {
            /**
             * @description Email subject
             * @example Important information about your account
             */
            subject: string;
            /**
             * @description HTML content of the email
             * @example <p>Hello, this is an <strong>important</strong> message.</p>
             */
            htmlPart?: string;
            /**
             * @description Plain text content of the email
             * @example Hello, this is an important message.
             */
            textPart?: string;
        };
        CreateSessionBridgeDto: {
            extraData?: {
                [key: string]: unknown;
            };
            quiz?: {
                [key: string]: unknown;
            };
            cookies: string;
            uuid?: string;
            analyticsId?: string;
            analyticsIdv3?: string;
            origin?: string;
            query: {
                [key: string]: unknown;
            };
            referer?: string;
            slug: string;
        };
        SessionResponseDto: {
            id: string;
            project: string;
            /**
             * @example {
             *       "session_id": "1234567890",
             *       "session_token": "1234567890"
             *     }
             */
            cookies: {
                [key: string]: unknown;
            };
            country: string;
            /** @description Address state, e.g. 'California', 'Texas', 'New York', etc. */
            state: string;
            createdAt: string;
            ip: string;
            isEu: boolean;
            /** @example https://www.example.com */
            origin: string;
            /**
             * @example {
             *       "utm_source": "google",
             *       "utm_medium": "cpc",
             *       "utm_campaign": "adwords"
             *     }
             */
            query: {
                [key: string]: unknown;
            };
            /** @example https://www.example.com */
            referer: string;
            /** @example main/a */
            slug: string;
            updatedAt: string;
            /** @example Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 */
            useragent: string;
            /**
             * @example {
             *       "language": "en",
             *       "currency": "USD",
             *       "email": "xxx@example.com"
             *     }
             */
            extraData: {
                [key: string]: unknown;
            };
        };
        SessionResponseFullDto: {
            success: number;
            data: components["schemas"]["SessionResponseDto"];
        };
        AppendSessionDto: {
            extraData?: {
                [key: string]: unknown;
            };
        };
        SessionResponseV2Dto: {
            id: string;
            project: string;
            /**
             * @example {
             *       "session_id": "1234567890",
             *       "session_token": "1234567890"
             *     }
             */
            cookies: {
                [key: string]: unknown;
            };
            country: string;
            /** @description Address state, e.g. 'California', 'Texas', 'New York', etc. */
            state: string;
            createdAt: string;
            ip: string;
            isEu: boolean;
            /** @example https://www.example.com */
            origin: string;
            /**
             * @example {
             *       "utm_source": "google",
             *       "utm_medium": "cpc",
             *       "utm_campaign": "adwords"
             *     }
             */
            query: {
                [key: string]: unknown;
            };
            /** @example https://www.example.com */
            referer: string;
            /** @example main/a */
            slug: string;
            updatedAt: string;
            /** @example Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 */
            useragent: string;
            /**
             * @example {
             *       "language": "en",
             *       "currency": "USD",
             *       "email": "xxx@example.com"
             *     }
             */
            extraData: {
                [key: string]: unknown;
            };
            currency: string;
            email: string;
            countryCode: string;
        };
        SessionResponseV2FullDto: {
            success: number;
            data: components["schemas"]["SessionResponseV2Dto"];
        };
        SessionResponseCurrencyInfo: {
            /**
             * @description Currency code (ISO 4217)
             * @example USD
             */
            currency: string;
            /**
             * @description Country name
             * @example United States
             */
            country: string;
            /**
             * @description Currency symbol
             * @example $
             */
            symbol: string;
            /**
             * @description Exchange rate relative to base currency
             * @example 1
             */
            rate: number;
        };
        SessionResponseWithCurrencyFullDto: {
            success: number;
            data: components["schemas"]["SessionResponseDto"];
            currency: components["schemas"]["SessionResponseCurrencyInfo"];
        };
        GetCurrencyDto: {
            /**
             * @example [
             *       "EUR",
             *       "GBP"
             *     ]
             */
            currencies: string[];
        };
        CurrencyRateResponseDto: {
            /**
             * @description Unique ID of the rate record
             * @example 6
             */
            id: number;
            /**
             * @description Date when the rate was recorded
             * @example 2025-09-24
             */
            date: string;
            /**
             * @description Target currency code (ISO 4217)
             * @example PKR
             */
            currency: string;
            /**
             * @description Base currency code (ISO 4217)
             * @example USD
             */
            base_currency: string;
            /**
             * @description Exchange rate relative to base currency
             * @example 281.4
             */
            rate: number;
        };
        CartProductDto: {
            /**
             * @description Product title
             * @example Premium Plan
             */
            title: string;
            /**
             * @description Optional product description
             * @example Access to all premium features
             */
            description?: string;
            /**
             * @description Product SKU
             * @example PREMIUM-001
             */
            sku: string;
            /**
             * @description Product image URL
             * @example https://cdn.example.com/images/premium.png
             */
            image?: string;
            /**
             * @description Current price to be charged
             * @example 19.99
             */
            price: number;
            /**
             * @description Regular (non-discounted) price
             * @example 29.99
             */
            regularPrice?: number;
            /**
             * @description Subscription billing price per period
             * @example 19.99
             */
            subBillingPrice?: number;
            /**
             * @description Interval count for subscription billing (e.g., every 1 month)
             * @example 1
             */
            subBillingInt?: number;
            /**
             * @description Subscription billing period
             * @enum {string}
             */
            subPeriod?: "week" | "month";
        };
        CartItemDto: {
            /**
             * @description Quantity of the product in the cart
             * @example 1
             */
            quantity: number;
            /** @description Product details */
            product: components["schemas"]["CartProductDto"];
            /**
             * @description Pathname of the upsell product
             * @example /main/a/up/29b37414-c5d1-4ecf-87dc-e669da9b40a9/ultimate-guide-to-filming-and-editing-videos-v1-es
             */
            pathname?: string;
        };
        CustomerPaidCartResponseDto: {
            /**
             * @description Success flag
             * @example 1
             */
            success: number;
            /** @example EUR */
            currency: string;
            /**
             * @description Payment method
             * @example primer
             */
            pm: string;
            data: components["schemas"]["CartItemDto"][];
        };
        CreateCartDto: {
            id: string;
            customerId: string;
            currency: string;
            extraData?: {
                [key: string]: unknown;
            };
            cart: components["schemas"]["CartItemDto"][];
        };
        CartPspDto: {
            /** @example https://primer.crm.apidata.app/app/public/session */
            url: string;
            /** @example primer */
            name: string;
        };
        CartTotalsDto: {
            /** @example 27.46 */
            cart: number;
            /** @example 54.92 */
            regular: number;
            /** @example 27.46 */
            withTax: number;
            /** @example 27.46 */
            woShipping: number;
            /** @example 27.46 */
            discountValue: number;
            /** @example 50 */
            discountPercent: number;
        };
        CartExtraDataDto: {
            psp: components["schemas"]["CartPspDto"];
            totals: components["schemas"]["CartTotalsDto"];
        };
        CartResponseDto: {
            /** @example a391f465-8da0-4b9a-8a1f-c5a0d2c5b7e5 */
            id: string;
            /**
             * @description Creation timestamp (server format)
             * @example 2025-08-18 16:10:26
             */
            createdAt: string;
            /**
             * @description Last update timestamp (server format)
             * @example 2025-08-18 16:10:26
             */
            updatedAt: string;
            extraData?: components["schemas"]["CartExtraDataDto"];
            cart: components["schemas"]["CartItemDto"][];
            /** @example 0 */
            status: number;
            /** @example EUR */
            currency: string;
        };
        CartFullResponseDto: {
            /** @example 1 */
            success: number;
            data: components["schemas"]["CartResponseDto"];
        };
        AppendCartItemDto: {
            cart: components["schemas"]["CartItemDto"][];
        };
        MarkPurchasedCartDto: {
            pm: string;
        };
        CreateWebhookDto: {
            /** @description The title of the webhook */
            title?: string;
            /** @description The events that trigger the webhook */
            events: string[];
            /** @description The URL endpoint to send the webhook to */
            endpoint: string;
            /**
             * @description The HTTP method to use when sending the webhook
             * @default GET
             */
            method: string;
            /** @description The authorization header to use when sending the webhook */
            authorization?: string;
            /** @description The project associated with the webhook */
            project?: string;
        };
        WebhookResponseDto: {
            /** @description The unique identifier of the webhook */
            id: number;
            /** @description The title of the webhook */
            title?: string;
            /** @description The events that trigger the webhook */
            events: string[];
            /** @description The URL endpoint to send the webhook to */
            endpoint: string;
            /**
             * @description The HTTP method to use when sending the webhook
             * @default GET
             */
            method: string;
            /** @description The authorization header to use when sending the webhook */
            authorization?: string;
            /** @description The project associated with the webhook */
            project?: string;
        };
        UpdateWebhookDto: {
            /** @description The title of the webhook */
            title?: string;
            /** @description The URL endpoint to send the webhook to */
            endpoint?: string;
            /** @description The HTTP method to use when sending the webhook */
            method?: string;
            /** @description The authorization header to use when sending the webhook */
            authorization?: string;
            /** @description The project associated with the webhook */
            project?: string;
        };
        QuizResponseDto: {
            /**
             * @description Quiz data with dynamic keys
             * @example {
             *       "q-1": {
             *         "q": "What is your age?",
             *         "v": {
             *           "answer": "25"
             *         }
             *       },
             *       "q-2": {
             *         "q": "Which Social Media Platform Do You Use the most?",
             *         "v": {
             *           "answers": [
             *             "Facebook",
             *             "TikTok"
             *           ]
             *         }
             *       }
             *     }
             */
            quiz: {
                [key: string]: unknown;
            };
        };
        QuizFullResponseDto: {
            /**
             * @description Success flag
             * @example 1
             */
            success: number;
            /** @description Response data containing quiz information */
            data: components["schemas"]["QuizResponseDto"];
        };
        RealtimeUtmSearchDetailDto: {
            source: string;
            medium: string;
            campaign: string;
            content: string;
        };
        RealtimeUtmSearchResponseDto: {
            first: components["schemas"]["RealtimeUtmSearchDetailDto"];
            last: components["schemas"]["RealtimeUtmSearchDetailDto"];
            lastPaid: components["schemas"]["RealtimeUtmSearchDetailDto"];
        };
        TrackRealtimeEventDto: {
            type: string;
            uuid?: string;
            pathname: string;
            referer: string;
            origin: string;
            /**
             * @example {
             *       "session_id": "a1b2c3d4-e5f6-7890",
             *       "status": "active"
             *     }
             */
            query: {
                [key: string]: string;
            };
            /**
             * @example {
             *       "user_id": 12345,
             *       "session_id": "a1b2c3d4-e5f6-7890",
             *       "status": "active",
             *       "retry_count": 3
             *     }
             */
            eventData?: {
                [key: string]: string | number;
            };
            /**
             * @example {
             *       "user_id": 12345,
             *       "session_id": "a1b2c3d4-e5f6-7890",
             *       "status": "active",
             *       "retry_count": 3
             *     }
             */
            attr?: {
                [key: string]: string | number;
            };
            skipEvent?: boolean;
        };
        CreateRealtimeAttributeDtoBridge: {
            attr_key: string;
            attr_value: string;
            funnel: string;
            created_at: number;
            uuid: string;
        };
        CreateRealtimeEventDtoBridge: {
            uuid: string;
            name: string;
            data?: {
                [key: string]: unknown;
            };
            order_id?: string;
            created_at: number;
            funnel: string;
        };
        CreateRealtimeSessionDtoBridge: {
            uuid: string;
            ip: string;
            user_agent: string;
            origin: string;
            referer: string;
            os: string;
            browser: string;
            type: string;
        };
        CreateRealtimeUtmDtoBridge: {
            utm_key: string;
            utm_value: string;
            funnel: string;
            created_at: number;
            uuid: string;
        };
        SessionsFindSessionByEmailDto: {
            /**
             * @description The unique identifier of the session.
             * @example 1
             */
            id: number;
            /**
             * @description The UUID of the session.
             * @example a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6
             */
            uuid: string;
            /**
             * @description The cookies associated with the session.
             * @example {
             *       "key": "value"
             *     }
             */
            cookies: Record<string, never>;
            /**
             * @description The email associated with the session.
             * @example test@example.com
             */
            email: string;
            /**
             * @description Indicates if the session resulted in a purchase.
             * @example true
             */
            isPurchased: boolean;
            /**
             * @description Extra data associated with the session.
             * @example {
             *       "data": "extra"
             *     }
             */
            extraData: Record<string, never>;
        };
        UpdateResult: Record<string, never>;
        VerifyPhoneResponseDto: {
            /** @description Valid number or not */
            valid: boolean;
            /** @description Landline number or not. Possible values: 1 - YES, 0 - NO, -1 - api not support this feature */
            landline: number;
            /** @description Validation error if exists */
            error: string;
        };
        VerifyEmailResponseDto: {
            /** @description Valid email or not */
            valid: boolean;
            /** @description Validation error if exists */
            error?: string;
        };
        PaymentCreateSessionBridgeRequestDto: {
            /** @description Unique Customer ID for the transaction. */
            referenceId: string;
            paymentDescription: string;
            /**
             * @description Optional metadata for the transaction.
             * @example {
             *       "orderId": "123",
             *       "customerId": "456"
             *     }
             */
            metaData?: {
                [key: string]: unknown;
            };
            cart: components["schemas"]["CartItemDto"][];
        };
        PaymentCreateSessionBridgeResponseItemDto: {
            /**
             * @description The token for the payment session
             * @example tok_1234567890
             */
            token: string;
            /**
             * @description The source for the payment session from integration system
             * @example paypal-us
             */
            source: string;
            /**
             * @description The provider for the payment session
             * @example paypal
             */
            provider: string;
        };
        PaymentUpdateSessionBridgeRequestDto: {
            /** @description Unique Customer ID for the transaction. */
            referenceId: string;
            paymentDescription: string;
            /**
             * @description Optional metadata for the transaction.
             * @example {
             *       "orderId": "123",
             *       "customerId": "456"
             *     }
             */
            metaData?: {
                [key: string]: unknown;
            };
            cart: components["schemas"]["CartItemDto"][];
            tokens: components["schemas"]["PaymentCreateSessionBridgeResponseItemDto"][];
        };
        PaymentUpdateSessionBridgeResponseDto: {
            success: boolean;
        };
        EarlyFraudWarningSearchDto: {
            /**
             * @description Start date in YYYY-MM-DD format.
             * @example 2025-08-01
             */
            startDate?: string;
            /**
             * @description End date in YYYY-MM-DD format.
             * @example 2025-08-10
             */
            endDate?: string;
        };
        YunoCreatePaymentDto: {
            /** @description Main Order ID */
            referenceId: string;
            /** @description Payment method */
            paymentMethod: string;
            /** @description Payment token */
            token: string;
        };
        CheckoutConditionsDto: {
            /** @example true */
            enabled: boolean;
            /** @example null */
            rules: Record<string, never> | null;
        };
        YunoCheckoutDto: {
            /** @example xxxxxx-xxxxx-xxxx-xxxx-xxxxxxx */
            session: string;
            /** @example true */
            sdk_required_action: boolean;
            conditions: components["schemas"]["CheckoutConditionsDto"];
        };
        YunoPaymentMethodResponseDto: {
            /** @example Card */
            name: string;
            /** @example xxxx */
            vaulted_token: string | null;
            /** @example Card */
            description: string;
            /** @example CARD */
            type: string;
            /** @example CARD */
            category: string;
            /** @example https://sdk.prod.y.uno/brands/card_image.png */
            icon: string;
            /** @example null */
            last_successfully_used: string | null;
            /** @example null */
            last_successfully_used_at: string | null;
            checkout: components["schemas"]["YunoCheckoutDto"];
            /** @example true */
            preferred: boolean;
        };
        PaymentRefundRequestDto: {
            /** @description Order ID */
            orderId: string;
            /** @description Transaction or Charge ID */
            transactionId: string;
            /** @description Refund amount */
            amount: number;
            /** @description Original transaction amount */
            originalAmount?: number;
            /** @description Currency */
            currency: string;
        };
        PaymentRefundResponseDto: {
            /** @description Success or not */
            success: boolean;
            /**
             * @description Refund type
             * @enum {string}
             */
            type: "refund" | "cancel";
            /** @description Refund error if exists */
            error: string;
        };
        PrimerCreateReferencePaymentRequestDto: {
            /**
             * @description The payment method token used to authorize the payment. If not provided, we will search for a token by client.
             * @example oXxI7BvGTZWRBucAd92D-HwxNzU0NDAxNTUy
             */
            paymentMethodToken?: string;
            /**
             * @description Your reference for the payment
             * @example 123456789
             */
            orderId: string;
            /**
             * @description The customer ID for the payment
             * @example 67a8d72e-d8a4-4e98-8786-ee079c6c7d6f
             */
            customerId: string;
            /**
             * @description The currency code for the payment
             * @example USD
             */
            currencyCode: string;
            /**
             * @description The amount you would like to charge the customer, in minor units. e.g. for $7, use 700.
             * @example 1000
             */
            amount: number;
            /**
             * @description Payment metadata (optional)
             * @example {
             *       "productId": 123,
             *       "merchantId": "a13bsd62s"
             *     }
             */
            metadata?: {
                [key: string]: unknown;
            };
            customer: components["schemas"]["PrimerCreatePaymentRequestCustomer"];
            order: components["schemas"]["PrimerCreatePaymentRequestOrder"];
        };
        PrimerCreatePaymentResponseDto: {
            /** @example success */
            success: boolean;
            data: components["schemas"]["PrimerPaymentResponseDto"];
        };
        PrimerCreateRecurringPaymentRequestDto: {
            /**
             * @description The payment method token used to authorize the payment. If not provided, we will search for a token by client.
             * @example oXxI7BvGTZWRBucAd92D-HwxNzU0NDAxNTUy
             */
            paymentMethodToken?: string;
            /**
             * @description Your reference for the payment
             * @example 123456789
             */
            orderId: string;
            /**
             * @description The customer ID for the payment
             * @example 67a8d72e-d8a4-4e98-8786-ee079c6c7d6f
             */
            customerId: string;
            /**
             * @description The currency code for the payment
             * @example USD
             */
            currencyCode: string;
            /**
             * @description The amount you would like to charge the customer, in minor units. e.g. for $7, use 700.
             * @example 1000
             */
            amount: number;
            /**
             * @description Payment metadata (optional)
             * @example {
             *       "productId": 123,
             *       "merchantId": "a13bsd62s"
             *     }
             */
            metadata?: {
                [key: string]: unknown;
            };
            customer: components["schemas"]["PrimerCreatePaymentRequestCustomer"];
            order: components["schemas"]["PrimerCreatePaymentRequestOrder"];
        };
        PrimerCreateReferencePaymentRequestWithDelayDto: {
            /**
             * @description The payment method token used to authorize the payment. If not provided, we will search for a token by client.
             * @example oXxI7BvGTZWRBucAd92D-HwxNzU0NDAxNTUy
             */
            paymentMethodToken?: string;
            /**
             * @description Your reference for the payment
             * @example 123456789
             */
            orderId: string;
            /**
             * @description The amount you would like to charge the customer, in minor units. e.g. for $7, use 700.
             * @example 1000
             */
            amount: number;
            /**
             * @description Payment metadata (optional)
             * @example {
             *       "productId": 123,
             *       "merchantId": "a13bsd62s"
             *     }
             */
            metadata?: {
                [key: string]: unknown;
            };
            /**
             * @description The delay in minutes before the payment is processed
             * @example 10
             */
            delay: number;
        };
        TaxValueCountryStateRequestDto: {
            /**
             * @description ISO 3166-1 alpha-2 country code (e.g., US, CA)
             * @example US
             */
            countryCode: string;
            /**
             * @description State
             * @example Arizona
             */
            state: string;
            /**
             * @description Amount for tax calculation
             * @example 2
             */
            amount: number;
        };
        TaxValueCountryStateResponseDto: {
            /**
             * @description Tax percent
             * @example 5.6
             */
            taxPercent: number;
            /**
             * @description Tax amount
             * @example 2
             */
            taxAmount: number;
            /**
             * @description Amount with tax
             * @example 12
             */
            amountWithTax: number;
        };
        TaxPercentCountryStateRequestDto: {
            /**
             * @description ISO 3166-1 alpha-2 country code (e.g., US, CA)
             * @example US
             */
            countryCode: string;
            /**
             * @description State
             * @example Arizona
             */
            state: string;
        };
        TaxPercentCountryStateResponseDto: {
            /**
             * @description Tax percent
             * @example 5.6
             */
            taxPercent: number;
        };
        PaymentCreateSessionResponseDto: {
            /** @description Token for initiate payment session */
            token: string;
        };
        PaypalCaptureOrderResponseDto: {
            /** @example 23T524207X938445J */
            id: string;
            /** @example COMPLETED */
            status: string;
        };
        PaypalCapturePaymentResponseDto: {
            /** @example 23T524207X938445J */
            id: string;
            /** @example COMPLETED */
            status: string;
        };
        TokenRetrieveRequestDto: {
            /** @description Main Order ID */
            orderId: string;
            /** @description Charge ID */
            chargeId: string;
        };
        TokenRetrieveResponseDto: {
            /** @description Token */
            token: string;
            /** @description Token type */
            type: string;
        };
        ImportDisputesUrlRequestDto: {
            /**
             * @description URL of the CSV file to import
             * @example https://example.com/disputes.csv
             */
            url: string;
        };
        AdyenTransactionPaginatedResponseDto: {
            /** @description Array of items for the current page */
            data: string[];
            /** @description Total number of items available */
            total: number;
            /**
             * @description Current page number
             * @example 1
             */
            page: number;
            /**
             * @description Number of items per page
             * @example 10
             */
            limit: number;
        };
        ChargeResponseDto: {
            /**
             * @description Internal database ID.
             * @example 1
             */
            id: number;
            /**
             * @description Stripe charge ID.
             * @example ch_123
             */
            sourceId: string;
            /**
             * @description Time at which the charge was created on Stripe. Seconds since Unix epoch.
             * @example 1679090539
             */
            created: number;
            /**
             * @description True if the object exists in live mode; false if the object exists in test mode.
             * @example false
             */
            livemode: boolean;
            /** @description Full Stripe charge object stored as JSON. */
            data: Record<string, never>;
            /**
             * Format: date-time
             * @description Record creation timestamp.
             */
            createdAt: string;
            /**
             * Format: date-time
             * @description Record last update timestamp.
             */
            updatedAt: string;
        };
        BadRequestErrorDto: {
            /**
             * @example [
             *       "property should not exist",
             *       "page must be a number conforming to the specified constraints"
             *     ]
             */
            message: Record<string, never>;
            /** @example Bad Request */
            error: string;
            /** @example 400 */
            statusCode: number;
        };
        DisputeResponseDto: {
            /** @example PP-D-12345 */
            dispute_id: string;
            /** @example OPEN */
            dispute_state: string;
            /** @example INQUIRY */
            dispute_stage: string;
            /** @example 2025-09-25T12:34:56Z */
            create_time: string;
            /** @example 2025-09-26T12:34:56Z */
            update_time: string;
            /** @example 100 */
            disputed_amount_value: number;
            /** @example USD */
            disputed_amount_currency: string;
            /** @example Unauthorized transaction reported by buyer */
            reason: string;
        };
        EarlyFraudWarningResponseDto: {
            /**
             * @description Internal database ID.
             * @example 1
             */
            id: number;
            /**
             * @description The unique identifier for the resource, from Stripe.
             * @example issfr_1Pb2dF2eZvKYlo2C5Z4Z4Z4Z
             */
            sourceId: string;
            /**
             * @description String representing the object's type.
             * @example radar.early_fraud_warning
             */
            object: string;
            /**
             * @description Whether the fraud warning is actionable.
             * @example true
             */
            actionable: boolean;
            /**
             * @description ID of the charge this fraud warning is for.
             * @example ch_3Pb2dF2eZvKYlo2C1Z4Z4Z4Z
             */
            charge: string;
            /**
             * @description Time at which the object was created. Measured in seconds since the Unix epoch.
             * @example 1672531199
             */
            created: number;
            /**
             * @description The type of fraud.
             * @example card_risk_level_elevated
             */
            fraudType: string;
            /**
             * @description Has the value true if the object exists in live mode or the value false if the object exists in test mode.
             * @example false
             */
            livemode: boolean;
            /**
             * Format: date-time
             * @description Timestamp of when the record was created in the database.
             */
            createdAt: string;
            /**
             * Format: date-time
             * @description Timestamp of when the record was last updated in the database.
             */
            updatedAt: string;
        };
        RefundResponseDto: {
            /**
             * @description Primary ID of the refund record
             * @example 1
             */
            id: number;
            /**
             * @description External identifier for the refund
             * @example REF-001
             */
            externalId: string;
            /**
             * @description Refund metadata or provider response stored as JSON
             * @example {
             *       "status": "COMPLETED",
             *       "amount": {
             *         "value": "15.00",
             *         "currency_code": "USD"
             *       },
             *       "reason": "Customer request",
             *       "payer_info": {
             *         "email": "customer@example.com"
             *       },
             *       "transaction_id": "TRX-REF-998812"
             *     }
             */
            data: Record<string, never> | null;
            /**
             * Format: date-time
             * @description Timestamp when the refund record was created
             * @example 2025-11-10T06:40:51.000Z
             */
            createdAt: string;
            /**
             * Format: date-time
             * @description Timestamp when the refund record was last updated
             * @example 2025-11-10T06:40:51.000Z
             */
            updatedAt: string;
        };
        PaymentResponseDto: {
            /** @example 1 */
            id: number;
            /** @example pay_123456789 */
            external_id: string;
            /** @example SETTLED */
            status: Record<string, never> | null;
            /** @example 1000 */
            amount: Record<string, never> | null;
            /** @example USD */
            currency: Record<string, never> | null;
            /**
             * Format: date-time
             * @example 2024-01-01T00:00:00.000Z
             */
            created_at: string;
            /**
             * Format: date-time
             * @example 2024-01-01T00:00:00.000Z
             */
            updated_at: string;
        };
        PaymentsListResponseDto: {
            data: components["schemas"]["PaymentResponseDto"][];
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 100 */
            total: number;
            /** @example 10 */
            total_pages: number;
        };
        TransactionResponseDto: {
            /** @example 1 */
            id: number;
            /** @example txn_123456789 */
            external_txn_id: string;
            /** @example 123 */
            payment_id: number;
            /** @example pay_123456789 */
            payment_external_id: string;
            /**
             * Format: date-time
             * @example 2024-01-01T00:00:00.000Z
             */
            created_at: string;
            /**
             * Format: date-time
             * @example 2024-01-01T00:00:00.000Z
             */
            updated_at: string;
        };
        TransactionsListResponseDto: {
            data: components["schemas"]["TransactionResponseDto"][];
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 100 */
            total: number;
            /** @example 10 */
            total_pages: number;
        };
        RefundsListResponseDto: {
            data: components["schemas"]["RefundResponseDto"][];
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 100 */
            total: number;
            /** @example 10 */
            total_pages: number;
        };
        OrderDto: {
            /** @example DE */
            countryCode: string;
        };
        BillingAddressDto: {
            /** @example DE */
            countryCode: string;
        };
        CustomerDto: {
            /** @example nadiakraevaa@gmail.com */
            emailAddress: string;
            billingAddress: components["schemas"]["BillingAddressDto"];
        };
        BinDataDto: {
            /** @example MASTERCARD */
            network: string;
            /** @example DE */
            issuerCountryCode: string;
            /** @example DEUTSCHER SPARKASSEN UND GIROVERBAND */
            issuerName: string;
            /** @example EUR */
            issuerCurrencyCode: string;
            /** @example UNKNOWN */
            regionalRestriction: string;
            /** @example DIGITAL_PAN */
            accountNumberType: string;
            /** @example DEBIT */
            accountFundingType: string;
            /** @example NOT_APPLICABLE */
            prepaidReloadableIndicator: string;
            /** @example CONSUMER */
            productUsageType: string;
            /** @example MDS */
            productCode: string;
            /** @example DEBIT STANDARD */
            productName: string;
        };
        PaymentMethodDataDto: {
            /**
             * @description Last 4 digits of the card
             * @example 4242
             */
            last4Digits: string;
            /**
             * @description First 6 digits of the card
             * @example 424242
             */
            first6Digits: string;
            /**
             * @description Expiration month
             * @example 04
             */
            expirationMonth: string;
            /**
             * @description Expiration year
             * @example 2028
             */
            expirationYear: string;
            /**
             * @description Card network
             * @example VISA
             */
            network: string;
            /**
             * @description Whether the card is network tokenized
             * @example false
             */
            isNetworkTokenized: boolean;
            /** @description BIN data information */
            binData: {
                [key: string]: unknown;
            } & components["schemas"]["BinDataDto"];
            /**
             * @description Network transaction ID
             * @example 575454110835311
             */
            networkTransactionId: string;
            /**
             * @description Account funding type
             * @example CREDIT
             */
            accountFundingType: string;
        };
        ThreeDSecureAuthenticationDto: {
            /** @example NOT_PERFORMED */
            responseCode: string;
        };
        PaymentMethodDto: {
            /** @example SUBSCRIPTION */
            paymentType: string;
            /** @example FINAL */
            authorizationType: string;
            /** @example Z3-cwYTuSfCklsqVHTtINnwxNzU0NzI1NzM5 */
            paymentMethodToken: string;
            /** @example true */
            isVaulted: boolean;
            /** @example 7T5oQC13Vlaff55v8jGb1HJW */
            analyticsId: string;
            /** @example APPLE_PAY */
            paymentMethodType: string;
            paymentMethodData: components["schemas"]["PaymentMethodDataDto"];
            threeDSecureAuthentication: components["schemas"]["ThreeDSecureAuthenticationDto"];
        };
        ProcessorDto: {
            /** @example ADYEN */
            name: string;
            /** @example Parenting_Leader */
            processorMerchantId: string;
            /** @example 0 */
            amountCaptured: number;
            /** @example 0 */
            amountRefunded: number;
        };
        TransactionDto: {
            amount: components["schemas"]["AmountDto"];
            payee: components["schemas"]["PayeeDto"];
            description: string;
            invoice_number: string;
            item_list: components["schemas"]["ItemListDto"];
            related_resources: components["schemas"]["RelatedResourceDto"][];
        };
        CvvCheckDto: {
            /** @example ADYEN */
            source: string;
            /** @example NOT_APPLICABLE */
            result: string;
        };
        AvsCheckResultDto: {
            /** @example NOT_APPLICABLE */
            streetAddress: string;
            /** @example NOT_APPLICABLE */
            postalCode: string;
        };
        AvsCheckDto: {
            /** @example ADYEN */
            source: string;
            result: components["schemas"]["AvsCheckResultDto"];
        };
        RiskDataDto: {
            cvvCheck: components["schemas"]["CvvCheckDto"];
            avsCheck: components["schemas"]["AvsCheckDto"];
        };
        PrimerPaymentResponseDto: {
            /** @example KYmx2y97s */
            id: string;
            /** @example 2025-09-08T21:18:47.546807 */
            date: string;
            /** @example 2025-09-08T21:18:49.821816 */
            dateUpdated: string;
            /** @example 5359 */
            amount: number;
            /** @example EUR */
            currencyCode: string;
            /** @example 8557a01b-f88d-4154-8c50-37deab59eb71 */
            customerId: string;
            /**
             * @example {
             *       "captureAt": 1757704727,
             *       "email": "nadiakraevaa@gmail.com",
             *       "manualCapture": true,
             *       "order_id": "8557a01b-f88d-4154-8c50-37deab59eb71-re-25092",
             *       "prevPsp": "adyen",
             *       "sourceId": 238256,
             *       "subId": 76070,
             *       "trafficSplit": 5,
             *       "tx": 0,
             *       "txp": 0
             *     }
             */
            metadata: Record<string, never>;
            /** @example 8557a01b-f88d-4154-8c50-37deab59eb71-re-25092 */
            orderId: string;
            /**
             * @example AUTHORIZED
             * @enum {string}
             */
            status: "PENDING" | "FAILED" | "AUTHORIZED" | "SETTLING" | "PARTIALLY_SETTLED" | "SETTLED" | "DECLINED" | "CANCELLED";
            order: components["schemas"]["OrderDto"];
            customer: components["schemas"]["CustomerDto"];
            paymentMethod: components["schemas"]["PaymentMethodDto"];
            processor: components["schemas"]["ProcessorDto"];
            transactions: components["schemas"]["TransactionDto"][];
            riskData: components["schemas"]["RiskDataDto"];
        };
        PrimerPaymentPaginatedResponseDto: {
            /** @example eyJ...== */
            nextCursor: string | null;
            /** @example null */
            prevCursor: string | null;
            data: components["schemas"]["PrimerPaymentResponseDto"][];
        };
        ActionLogResponseDto: {
            /**
             * @description The ID of the action log.
             * @example 1
             */
            id: number;
            /**
             * @description The reference ID of the action log.
             * @example some-reference-id
             */
            referenceId: Record<string, never>;
            /**
             * @description The URL of the action.
             * @example /api/v1/some-action
             */
            actionUrl: string;
            /**
             * @description The body of the action.
             * @example {
             *       "key": "value"
             *     }
             */
            body: Record<string, never>;
            /**
             * @description The response of the action.
             * @example {
             *       "success": true
             *     }
             */
            response: Record<string, never>;
            /**
             * Format: date-time
             * @description The creation date of the action log.
             * @example 2021-01-01T00:00:00.000Z
             */
            createdAt: string;
        };
        PaginatedActionLogResponseDto: {
            data: components["schemas"]["ActionLogResponseDto"][];
            /** @example 100 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 10 */
            totalPages: number;
        };
        OrderRequestResponseDto: {
            /**
             * @description The ID of the order request.
             * @example 1
             */
            id: number;
            /**
             * @description The UUID of the order request.
             * @example f47ac10b-58cc-4372-a567-0e02b2c3d479
             */
            uuid: string;
            /**
             * @description The body of the order request.
             * @example {
             *       "key": "value"
             *     }
             */
            body: Record<string, never>;
            /**
             * Format: date-time
             * @description The creation date of the order request.
             * @example 2021-01-01T00:00:00.000Z
             */
            created_at: string;
        };
        PaginatedOrderRequestResponseDto: {
            data: components["schemas"]["OrderRequestResponseDto"][];
            /** @example 100 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 10 */
            totalPages: number;
        };
        RefundsLogResponseDto: {
            /**
             * @description The ID of the refund log.
             * @example 1
             */
            id: number;
            /**
             * @description The order ID of the refund log.
             * @example some-order-id
             */
            orderId: string;
            /**
             * @description The transaction ID of the refund log.
             * @example some-transaction-id
             */
            transactionId: string;
            /**
             * @description The amount of the refund.
             * @example 100
             */
            amount: number;
            /**
             * @description The currency of the refund.
             * @example USD
             */
            currency: string;
            /**
             * @description The status of the refund.
             * @example success
             */
            status: string;
            /**
             * @description The message of the refund.
             * @example Refund successful
             */
            message: string;
            /**
             * Format: date-time
             * @description The creation date of the refund log.
             * @example 2021-01-01T00:00:00.000Z
             */
            createdAt: string;
        };
        PaginatedRefundsLogResponseDto: {
            data: components["schemas"]["RefundsLogResponseDto"][];
            /** @example 100 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 10 */
            totalPages: number;
        };
        PayerInfoDto: {
            email: string;
            first_name: string;
            last_name: string;
            payer_id: string;
            country_code: string;
        };
        TransactionRawResponseDto: {
            /** @example 9GS00022P28620007 */
            transaction_id?: string;
            /** @example COMPLETED */
            transaction_status?: string;
            /**
             * @example {
             *       "value": "50.00",
             *       "currency_code": "USD"
             *     }
             */
            transaction_amount?: Record<string, never>;
            payer_info: components["schemas"]["PayerInfoDto"];
        };
        PaypalTransactionResponseDto: {
            /** @example 2 */
            id: number;
            /** @example 90A000009K706721B */
            transactionId: string;
            /** @example Z5G000XWTTNPS */
            accountNumber: string;
            rawResponse: components["schemas"]["PaypalTransactionRawResponseDto"];
            /** @example 2025-09-18T10:15:08.153Z */
            createdAt: string;
        };
        PaginatedTransactionResponseDto: {
            data: components["schemas"]["PaypalTransactionResponseDto"][];
            /** @example 100 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 10 */
            totalPages: number;
        };
        PaypalFetchTransactionsDto: {
            /**
             * @description Start date (ISO 8601 format: YYYY-MM-DDTHH:mm:ssZ)
             * @example 2025-08-01T00:00:00Z
             */
            startDate: string;
            /**
             * @description End date (ISO 8601 format: YYYY-MM-DDTHH:mm:ssZ)
             * @example 2025-08-02T23:59:59Z
             */
            endDate: string;
            /**
             * @description Optional transaction ID to filter by
             * @example 9GS80322P28628837
             */
            transactionId?: string;
            /**
             * @description Indicates whether the response includes only balance-impacting transactions or all transactions
             * @enum {string}
             */
            balanceAffectingRecordsOnly?: "Y" | "N";
        };
        PaypalFetchTransactionsResponseDto: {
            /** @example success */
            status: string;
            /** @example Transactions fetched and stored successfully! */
            message: string;
            data: components["schemas"]["PaypalTransactionResponseDto"][] | null;
        };
        PaypalDisputesFetchQueryDto: {
            /**
             * @description Filter by dispute state. Allowed values: OPEN, WAITING_FOR_BUYER_RESPONSE, WAITING_FOR_SELLER_RESPONSE, UNDER_REVIEW, RESOLVED
             * @example OPEN
             */
            dispute_state?: string;
            /**
             * @description Filter by dispute stage. Allowed values: INQUIRY, CHARGEBACK, PRE_ARBITRATION
             * @example INQUIRY
             */
            dispute_stage?: string;
            /**
             * @description Filter disputes updated after this time (RFC3339 with milliseconds)
             * @example 2025-08-27T00:00:00.000Z
             */
            update_time_after?: string;
            /**
             * @description Filter disputes updated before this time (RFC3339 with milliseconds)
             * @example 2025-08-28T00:00:00.000Z
             */
            update_time_before?: string;
            /**
             * @description Page number (>=1, ignored if start_time is provided)
             * @example 1
             */
            page?: number;
            /**
             * @description Results per page (max 50, ignored if start_time is provided)
             * @example 20
             */
            page_size?: number;
            /**
             * @description Whether to return total count (ignored if start_time is provided)
             * @example true
             */
            total_required?: boolean;
        };
        PaypalCommonSuccessResponseDto: {
            /**
             * @description Indicates if the operation was successful
             * @example true
             */
            success: boolean;
        };
        PaypalCrmPaymentResponseDto: {
            status: string;
            sourceId: string;
            processorId: string;
            date: string;
            customer: string;
            total: number;
            currency: string;
            fee: number;
            sourceType: string;
            orderId: string;
            relations: string[];
        };
        FacebookCapiPayloadEventDataDto: {
            /** @example USD */
            currency?: string;
            /** @example 129.99 */
            total?: number;
            /** @example 129.99 */
            profit?: number;
            /** @example https://example.com/product/123 */
            sourceUrl: string;
        };
        FacebookCapiOriginalEventDataDto: {
            /** @example Purchase */
            event_name: string;
            /** @example xxxx */
            event_id: string;
            /** @example 1678886400 */
            event_time: number;
            /** @example xxxx */
            order_id: string;
        };
        CustomClientData: {
            /**
             * @description The user's email address.
             * @example joe@example.com
             */
            email?: string;
            /**
             * @description The user's IP address.
             * @example 123.123.123.123
             */
            ip?: string;
            /**
             * @description The user's browser user agent string.
             * @example Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...
             */
            userAgent?: string;
            /**
             * @description The Facebook click ID.
             * @example fb.1.1554763741205.AbCdEfGhIjKlMnOp
             */
            fbc?: string;
            /**
             * @description The Facebook browser ID.
             * @example fb.1.1558571054389.1098115397
             */
            fbp?: string;
            /**
             * @description The user country.
             * @example US
             */
            country?: string;
            /**
             * @description The user state.
             * @example DE
             */
            state?: string;
            /**
             * @description The user city.
             * @example Berlin
             */
            city?: string;
            /**
             * @description The user zip code.
             * @example 19901
             */
            zip?: string;
            /**
             * @description The user phone number.
             * @example +123123231
             */
            phone?: string;
        };
        FbCapiPayloadBridge: {
            /** @example EVENT_ID_123 */
            eventId: string;
            /** @example Purchase */
            eventName: string;
            eventData: components["schemas"]["FacebookCapiPayloadEventDataDto"];
            originalEventData?: components["schemas"]["FacebookCapiOriginalEventDataDto"];
            testEventCode?: string;
            clientData?: components["schemas"]["CustomClientData"];
        };
        FbCapiPayloadSessionBridge: {
            uuid: string;
            event: components["schemas"]["FbCapiPayloadBridge"];
        };
        SnapchatEventBridgeDto: {
            /** @description Event ID */
            eventId: string;
            /** @description Event name */
            eventName: string;
            /** @description Original page URL where the event occurred */
            sourceUrl?: string;
        };
        SnapChatEventDataDto: {
            /** @description ISO currency code (e.g., USD, EUR) */
            currency: string;
            /** @description Event value/total */
            value: number | string;
            /** @description Event Order ID */
            order_id: string;
        };
        SnapchatCapiBridgeDto: {
            uuid: string;
            event: components["schemas"]["SnapchatEventBridgeDto"];
            eventData: components["schemas"]["SnapChatEventDataDto"];
            /** @description Test event code for validation */
            testEventCode?: string;
        };
        TiktokCapiEventDataDto: {
            value: number;
            sku: string;
            /** @example USD */
            currency: string;
            /**
             * @description Content type
             * @example product
             */
            contentType: string;
            /** @example https://example.com/product/123 */
            sourceUrl: string;
        };
        TikTokCustomClientData: {
            /** @example 123.123.123.123 */
            ip?: string;
            /** @example Tiktok Advertising cookie */
            ttp?: string;
            /** @example Email */
            email?: string;
            /**
             * @description Click ID
             * @example 1234567890
             */
            ttclid?: string;
            /**
             * @description User agent
             * @example Mozilla/5.0 (Windows NT 10.0; Win64; x64)
             */
            userAgent?: string;
            /**
             * @description External ID
             * @example 1234567890
             */
            externalId?: string;
            /**
             * @description The user country.
             * @example US
             */
            country?: string;
            /**
             * @description The user state.
             * @example DE
             */
            state?: string;
            /**
             * @description The user city.
             * @example Berlin
             */
            city?: string;
            /**
             * @description The user zip code.
             * @example 19901
             */
            zip?: string;
            /**
             * @description The user phone number.
             * @example +123123231
             */
            phone?: string;
        };
        TiktokCapiPayloadBridge: {
            /** @example EVENT_ID_123 */
            eventId: string;
            /** @example Purchase */
            eventName: string;
            eventData: components["schemas"]["TiktokCapiEventDataDto"];
            testEventCode?: string;
            clientData?: components["schemas"]["TikTokCustomClientData"];
        };
        TiktokCapiPayloadSessionBridge: {
            uuid: string;
            event: components["schemas"]["TiktokCapiPayloadBridge"];
        };
        TrustpilotServiceReviewInvitationDto: {
            /** @example 507f191e810c19729de860ea */
            templateId: string;
            /**
             * @description Preferred send time in UTC (ISO 8601)
             * @example 2026-01-05T13:37:00Z
             */
            preferredSendTime?: string;
            /** @example http://trustpilot.com */
            redirectUri: string;
            /**
             * @example [
             *       "tag1",
             *       "tag2"
             *     ]
             */
            tags?: string[];
        };
        TrustpilotProductDto: {
            /** @example ABC-1234 */
            sku: string;
            /** @example Metal Toy Car */
            name: string;
            /** @example 7TX1641 */
            mpn: string;
            /** @example ACME */
            brand: string;
            /** @example http://www.mycompanystore.com/products/images/12345.jpg */
            imageUrl: string;
            /** @example http://www.mycompanystore.com/products/12345.htm */
            productUrl: string;
            /** @example 01234567890 */
            gtin: string;
            /** @example 1267 */
            productCategoryGoogleId: string;
        };
        TrustpilotProductReviewInvitationDto: {
            /** @example 507f191e810c19729de860ea */
            templateId: string;
            /** @example 2026-01-05T13:37:00Z */
            preferredSendTime?: string;
            /** @example http://trustpilot.com */
            redirectUri: string;
            products?: components["schemas"]["TrustpilotProductDto"][];
        };
        SendTrustpilotInvitationDto: {
            /** @example john.doe@trustpilot.com */
            replyTo?: string;
            /** @example en-US */
            locale?: string;
            /** @example John Doe */
            senderName?: string;
            /** @example john.doe@trustpilot.com */
            senderEmail?: string;
            /** @example ABC123 */
            locationId?: string;
            /** @example inv00001 */
            referenceNumber: string;
            /** @example John Doe */
            consumerName: string;
            /** @example john.doe@trustpilot.com */
            consumerEmail: string;
            /** @example email */
            type: string;
            serviceReviewInvitation?: components["schemas"]["TrustpilotServiceReviewInvitationDto"];
            productReviewInvitation?: components["schemas"]["TrustpilotProductReviewInvitationDto"];
        };
        SendTrustpilotInvitationResponseDto: {
            /** @example 200 */
            statusCode: number;
            /** @example Email invitation created successfully */
            message: string;
        };
        CreateTrustpilotInvitationLinkDto: {
            /** @description Optional Trustpilot location ID */
            locationId?: string;
            /** @example inv00001 */
            referenceId: string;
            /** @example john.doe@trustpilot.com */
            email: string;
            /** @example John Doe */
            name: string;
            /** @example en-US */
            locale: string;
            /**
             * @example [
             *       "tag1",
             *       "tag2"
             *     ]
             */
            tags?: string[];
            /** @example https://trustpilot.com */
            redirectUri: string;
        };
        CreateTrustpilotInvitationLinkResponseDto: {
            /** @description Invitation link id */
            id: string;
            /** @description Invitation link url */
            url: string;
        };
        TrustpilotTemplatesResponseDto: {
            id: string;
            name: string;
            isDefaultTemplate: boolean;
            locale?: string;
            language?: string;
            type: string;
        };
        TrustpilotInviteResponseDto: {
            /** @example 1 */
            id: number;
            /** @example ext-456 */
            externalId: string | null;
            /** @example customer@example.com */
            email: string;
            /** @example John Doe */
            name: string | null;
            /**
             * Format: date-time
             * @example 2025-09-09T10:00:00.000Z
             */
            scheduledAt: string;
            /**
             * Format: date-time
             * @example 2025-09-09T09:00:00.000Z
             */
            initialScheduledAt: string;
            /**
             * @example pending
             * @enum {string}
             */
            status: "pending" | "retry" | "sent" | "failed" | "cancelled";
            /** @example false */
            sent: boolean;
            /** @example 0 */
            attempts: number;
            /**
             * Format: date-time
             * @example 2025-09-08T12:00:00.000Z
             */
            lastAttemptAt: string | null;
            /** @example SMTP error: 550 rejected */
            lastError: string | null;
            /** @example batch-uuid-789 */
            batchId: string | null;
            /** @example 507f191e810c19729de860ea */
            templateId: string | null;
            /**
             * Format: date-time
             * @example 2025-09-08T08:00:00.000Z
             */
            createdAt: string;
            /**
             * Format: date-time
             * @example 2025-09-08T09:00:00.000Z
             */
            updatedAt: string;
        };
        PaginatedResponseDtoWithModel: {
            data: components["schemas"]["TrustpilotInviteResponseDto"][];
            /** @example 100 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 10 */
            totalPages: number;
        };
        ErpRequestDto: {
            /** @example Access request */
            type: string;
            /** @example Access request note */
            note: string;
            /**
             * @description Value of window.location.origin
             * @example http://localhost:3000
             */
            system: string;
            /**
             * @description Additional details
             * @example {
             *       "integrationId": "123"
             *     }
             */
            details: Record<string, never>;
        };
        ErpRequestResponseDto: {
            /** @example true */
            success: boolean;
        };
        PaymentCreateSessionRequestDto: {
            /** @description Unique Customer ID for the transaction. */
            referenceId: string;
            /** @description Currency code. */
            currency: string;
            /** @description Amount to charge. */
            amount: number;
            /** @description Customer email address. */
            email: string;
            /** @description Country code ISO 3166-1 alpha-2. */
            countryCode: string;
            paymentDescription: string;
            /**
             * @description Optional metadata for the transaction.
             * @example {
             *       "orderId": "123",
             *       "customerId": "456"
             *     }
             */
            metaData?: {
                [key: string]: unknown;
            };
        };
        PrimerClientErrorDto: {
            /** @example 400 */
            statusCode: number;
            /** @example Invalid referenceId or amount provided for Primer session. */
            message: string;
            /** @example Invalid input */
            error: string;
        };
        PrimerServerErrorDto: {
            /** @example 500 */
            statusCode: number;
            /** @example Failed to connect to Primer services. */
            message: string;
            /** @example An unexpected error occurred */
            error: string;
        };
        PrimerSessionUpdateRequestDto: {
            /**
             * @description The unique reference for the transaction.
             * @example order-12345
             */
            referenceId: string;
            /**
             * @description The currency of the transaction in ISO 4217 format.
             * @example USD
             */
            currency: string;
            /**
             * @description The amount of the transaction in minor units (e.g., 1000 for $10.00).
             * @example 1000
             */
            amount: number;
            /**
             * @description The email address of the customer.
             * @example customer@example.com
             */
            email: string;
            /**
             * @description The two-letter country code of the customer.
             * @example US
             */
            countryCode: string;
            /**
             * @description Optional metadata for the transaction.
             * @example {
             *       "orderId": "123",
             *       "customerId": "456"
             *     }
             */
            metaData?: Record<string, never>;
            /**
             * @description Client token obtained from Primer when the session was created. Use it to update the session.
             * @example cltk_eyJhbGciOiJIUzI1NiIsImtpZCI6ImNsaWVudC10b2tlbi1zaWduaW5nLWtleSIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTU2NjYzMDIsImFjY2Vzc1Rva2VuIjoiNTBlMGNkYzUtNDQ4Ny00ZjMyLTg0ZjEtNjk2OTE4ZjM5ZTAxIiwiYW5hbHl0aWNzVXJsI
             */
            clientToken: string;
        };
        CommonFeeDto: {
            /** @example SURCHARGE */
            type: string;
            /** @example 20 */
            amount: number;
        };
        CommonOrderLineItemDto: {
            /** @example t-shirt-1 */
            itemId: string;
            /** @example White T-Shirt */
            description: string;
            /** @example 500 */
            amount: number;
            /** @example 1 */
            quantity: number;
        };
        CommonShippingDto: {
            /** @example 50 */
            amount: number;
        };
        CommonPaymentMethodOptionsDto: {
            PAYMENT_CARD: Record<string, never>;
            GOOGLE_PAY: Record<string, never>;
            PAY_NL_IDEAL: Record<string, never>;
        };
        CommonPaymentMethodDto: {
            /** @example true */
            vaultOnSuccess: boolean;
            /** @example false */
            vaultOn3DS: boolean;
            options: components["schemas"]["CommonPaymentMethodOptionsDto"];
            /** @example ESTIMATED */
            authorizationType: string;
        };
        CommonOrderDto: {
            /** @example FR */
            countryCode: string;
            fees: components["schemas"]["CommonFeeDto"][];
            lineItems: components["schemas"]["CommonOrderLineItemDto"][];
            shipping: components["schemas"]["CommonShippingDto"];
            paymentMethod: components["schemas"]["CommonPaymentMethodDto"];
            /** @example ESTIMATED */
            authorizationType: string;
        };
        PrimerSessionUpdateResponseDto: {
            /** @example customer-123 */
            customerId: string;
            /** @example order-abc */
            orderId: string;
            /** @example GBP */
            currencyCode: string;
            /** @example 650 */
            amount: number;
            /**
             * @example {
             *       "productType": "Clothing"
             *     }
             */
            metadata: Record<string, never>;
            /**
             * @example {
             *       "emailAddress": "john@primer.io"
             *     }
             */
            customer: Record<string, never>;
            order: components["schemas"]["CommonOrderDto"];
        };
        SavedPaymentMethodDto: {
            /**
             * @description Creation timestamp
             * @example 2025-08-05T13:45:52.846912
             */
            createdAt: string;
            /**
             * @description Payment method token
             * @example oXxI7BvGTZWRBucAd92D-HwxNzU0NDAxNTUy
             */
            token: string;
            /**
             * @description Token type
             * @example MULTI_USE
             */
            tokenType: string;
            /**
             * @description Analytics ID
             * @example 8YSGDNw-XrS6OlW9BSPTBG5H
             */
            analyticsId: string;
            /**
             * @description Payment method type
             * @example PAYMENT_CARD
             */
            paymentMethodType: string;
            /** @description Payment method data */
            paymentMethodData: components["schemas"]["PaymentMethodDataDto"];
            /**
             * @description Customer ID
             * @example 67a8d72e-d8a4-4e98-8786-ee079c6c7d6f
             */
            customerId: string;
            /**
             * @description Payment method description
             * @example My first card
             */
            description?: string;
            /**
             * @description Whether the payment method is deleted
             * @example false
             */
            deleted: boolean;
            /**
             * @description Whether this is the default payment method
             * @example true
             */
            default: boolean;
        };
        PrimerPaymentMethodListResponseDto: {
            /** @description List of payment methods */
            data: components["schemas"]["SavedPaymentMethodDto"][];
        };
        PrimerPaymentReferenceChargeRequestDto: {
            /**
             * @description Payment method token from customer (get from /primer/payment-methods endpoint)
             * @example oXxI7BvGTZWRBucAd92D-HwxNzU0NDAxNTUy
             */
            token: string;
            /**
             * @description Customer ID (use test customer: 67a8d72e-d8a4-4e98-8786-ee079c6c7d6f)
             * @example 67a8d72e-d8a4-4e98-8786-ee079c6c7d6f
             */
            customerId: string;
            /**
             * @description Order ID (your unique order identifier)
             * @example order-abc-123
             */
            orderId: string;
            /**
             * @description Amount
             * @example 42
             */
            amount: number;
            /**
             * @description Currency code in ISO 4217 format
             * @example EUR
             */
            currency: string;
            /**
             * @description Country code (2-letter ISO code)
             * @example US
             */
            country: string;
            /**
             * @description Customer email address
             * @example customer123@gmail.com
             */
            email: string;
            /**
             * @description Payment metadata (optional)
             * @example {
             *       "productId": 123,
             *       "merchantId": "a13bsd62s"
             *     }
             */
            metaData?: {
                [key: string]: unknown;
            };
        };
        PrimerPaymentReferenceChargeResponseDto: {
            /**
             * @description Whether the reference charge was successful (true if status is SETTLED, SETTLING, or AUTHORIZED)
             * @example true
             */
            success: boolean;
            /**
             * @description Error message if the request failed
             * @example Payment failed
             */
            error?: string;
        };
        PrimerSyncJobSuccessResponseDto: {
            /**
             * @description Number of payments processed
             * @example 25
             */
            processed: number;
            /**
             * @description Number of successful responses
             * @example 20
             */
            respSuccess: number;
            /**
             * @description Number of failed responses
             * @example 3
             */
            failed: number;
            /**
             * @description Number of not found responses
             * @example 2
             */
            notFound: number;
            /** @example Payment sync completed successfully */
            message: string;
        };
        PrimerSyncJobErrorResponseDto: {
            /** @example error */
            status: string;
            /** @example Failed to execute payment sync job */
            message: string;
        };
        PrimerEnqueueSyncResponseDto: {
            /** @example success */
            status: string;
            /** @example Jobs enqueued for Primer sync */
            message: string;
        };
        PrimerPaymentGetResponseDto: {
            /**
             * @description Array of payment data
             * @example [
             *       {
             *         "id": "pay_123",
             *         "status": "SETTLED",
             *         "amount": 100,
             *         "currencyCode": "USD"
             *       }
             *     ]
             */
            data: string[];
            /** @example eyJ...== */
            nextCursor: Record<string, never> | null;
            /** @example null */
            prevCursor: Record<string, never> | null;
        };
        PrimerCreatePaymentRequestBillingAddress: {
            /**
             * @description Country code (2-letter ISO code)
             * @example US
             */
            countryCode: string;
        };
        PrimerCreatePaymentRequestCustomer: {
            /**
             * @description Customer email address
             * @example customer123@gmail.com
             */
            emailAddress: string;
            billingAddress: components["schemas"]["PrimerCreatePaymentRequestBillingAddress"];
        };
        PrimerCreatePaymentRequestPaymentMethod: {
            /** @description Whether the payment method should be vaulted on a successful payment or not. */
            vaultOnSuccess?: boolean;
            /** @description Whether the payment method should be vaulted after a successful 3DS authentication or not. */
            vaultOn3Ds?: boolean;
            /** @description A description of the payment, as it would typically appear on a bank statement. */
            descriptor?: string;
            /** @enum {string} */
            paymentType: "FIRST_PAYMENT" | "ECOMMERCE" | "SUBSCRIPTION" | "UNSCHEDULED";
            /**
             * @description Allows to adjust the authorized amount after the authorization, if supported by payment method.
             * @enum {string}
             */
            authorizationType?: "ESTIMATED" | "FINAL";
        };
        PrimerCreatePaymentRequestOrder: {
            /**
             * @description Country code (2-letter ISO code)
             * @example US
             */
            countryCode: string;
        };
        PrimerCreatePaymentRequestDto: {
            /**
             * @description The payment method token used to authorize the payment. If not provided, we will search for a token by client.
             * @example oXxI7BvGTZWRBucAd92D-HwxNzU0NDAxNTUy
             */
            paymentMethodToken?: string;
            /**
             * @description Your reference for the payment
             * @example 123456789
             */
            orderId: string;
            /**
             * @description The customer ID for the payment
             * @example 67a8d72e-d8a4-4e98-8786-ee079c6c7d6f
             */
            customerId: string;
            /**
             * @description The currency code for the payment
             * @example USD
             */
            currencyCode: string;
            /**
             * @description The amount you would like to charge the customer, in minor units. e.g. for $7, use 700.
             * @example 1000
             */
            amount: number;
            /**
             * @description Payment metadata (optional)
             * @example {
             *       "productId": 123,
             *       "merchantId": "a13bsd62s"
             *     }
             */
            metadata?: {
                [key: string]: unknown;
            };
            customer: components["schemas"]["PrimerCreatePaymentRequestCustomer"];
            paymentMethod: components["schemas"]["PrimerCreatePaymentRequestPaymentMethod"];
            order: components["schemas"]["PrimerCreatePaymentRequestOrder"];
        };
        PrimerPaymentSearchRequestDto: {
            /** @example 2025-08-01T00:00:00Z */
            from_date?: string;
            /** @example 2025-08-19T23:59:59Z */
            to_date?: string;
            /**
             * @description Payment status filter
             * @example SETTLED
             */
            status?: string;
            /**
             * @description Last 4 digits of card number
             * @example 1234
             */
            last_4_digits?: string;
            /**
             * @description Minimum amount in cents
             * @example 1000
             */
            min_amount?: number;
            /**
             * @description Maximum amount in cents
             * @example 5000
             */
            max_amount?: number;
            /**
             * @description Currency code filter
             * @example USD
             */
            currency_code?: string;
            /**
             * @description 1..100 (default 100)
             * @example 10
             */
            limit?: number;
            /**
             * @description ID of the customer that has made the payment
             * @example 123456789
             */
            customer_id?: string;
            /**
             * @description Filter payments by their payment processor.
             * @example 123456789
             */
            processor?: string;
            /**
             * @description Return payments related to this order ID.
             * @example 123456789
             */
            order_id?: string;
            /**
             * @description ID of the merchant involved in the payment.
             * @example 123456789
             */
            merchant_id?: string;
        };
        LineItemDto: {
            itemId?: string;
            description?: string;
            amount?: number;
            quantity?: number;
        };
        PrimerPaymentCreatePaymentRequestDto: {
            /** @example pm_token_123 */
            paymentMethodToken: string;
            /** @example 3000 */
            amount: number;
            /** @example GBP */
            currencyCode: string;
            /** @example order-123 */
            orderId: string;
            /** @example customer-123 */
            customerId?: string;
            customer?: components["schemas"]["CustomerDto"];
            paymentMethod?: components["schemas"]["PaymentMethodDto"];
            lineItems?: components["schemas"]["LineItemDto"][];
            metadata?: {
                [key: string]: unknown;
            };
        };
        PrimerPaymentCreateReferencePaymentRequestDto: {
            /** @example 3000 */
            amount: number;
            /** @example GBP */
            currencyCode: string;
            /** @example order-123 */
            orderId: string;
            customer?: components["schemas"]["CustomerDto"];
            lineItems?: components["schemas"]["LineItemDto"][];
            metadata?: {
                [key: string]: unknown;
            };
            /** @example pm_token_123 */
            paymentMethodToken?: string;
            /** @example customer-123 */
            customerId: string;
            /** @example true */
            manualCapture?: boolean;
        };
        PrimerPaymentCreateRecurringPaymentRequestDto: {
            /** @example 3000 */
            amount: number;
            /** @example GBP */
            currencyCode: string;
            /** @example order-123 */
            orderId: string;
            /** @example customer-123 */
            customerId?: string;
            customer?: components["schemas"]["CustomerDto"];
            lineItems?: components["schemas"]["LineItemDto"][];
            metadata?: {
                [key: string]: unknown;
            };
            /** @example pm_token_123 */
            paymentMethodToken?: string;
            /** @example true */
            manualCapture?: boolean;
        };
        PrimerPaymentCapturePaymentRequestDto: {
            /**
             * @description Amount to capture in minor units (e.g., cents). If not provided, captures the full authorized amount
             * @example 3000
             */
            amount?: number;
            /**
             * @description Whether this is the final capture. If false, allows subsequent captures
             * @default true
             * @example true
             */
            final: boolean;
            /**
             * @description Array of fields to expand in the response (e.g., transactions.events)
             * @example [
             *       "transactions.events"
             *     ]
             */
            expand?: string[];
        };
        PrimerPaymentRefundPaymentRequestDto: {
            /**
             * @description Amount to refund in minor units (e.g., cents). If not provided, defaults to full refund amount
             * @example 3000
             */
            amount?: number;
            /**
             * @description Transaction event ID to target a specific partial capture for refund
             * @example 57a2027d-36a6-494f-ad07-a6e1d0c77772
             */
            transactionEventId?: string;
            /**
             * @description Optional reason for the refund
             * @example Customer returned item
             */
            reason?: string;
        };
        PrimerPaymentCancelPaymentRequestDto: {
            /**
             * @description Optional reason for cancelling the payment
             * @example Customer cancelled order #1234.
             */
            reason?: string;
        };
        PrimerPaymentsBulkActionResponseDto: {
            /** @example 10 */
            processed: number;
            /** @example 10 */
            errors: number;
        };
        DataPaymentSearchRequestDto: {
            /**
             * @description Page number
             * @default 1
             * @example 1
             */
            page: string;
            /**
             * @description Number of items per page
             * @default 10
             * @example 10
             */
            limit: string;
            /** @description Quick Search field */
            quickSearch?: string;
            /**
             * @description Search by external_id (primerId)
             * @example pay_123456789
             */
            external_id?: string;
            /**
             * @description Payment status (comma-separated for multiple values)
             * @example SETTLED,AUTHORIZED
             */
            status?: string;
            /**
             * @description Search by email
             * @example
             */
            email?: string;
            /** @example 2025-08-09T23:59:59Z */
            payment_date_start?: string;
            /** @example 2025-08-19T23:59:59Z */
            payment_date_end?: string;
            /**
             * @description Search by payment type
             * @example Initial
             */
            payment_type?: string;
            /**
             * @description Search by refunded
             * @example false
             */
            refunded?: string;
        };
        PrimerDataPaymentResponseDto: {
            /** @example 1 */
            id: number;
            /** @example pay_123456789 */
            external_id: string;
            /** @example SETTLED */
            status: Record<string, never> | null;
            /** @example 1000 */
            amount: Record<string, never> | null;
            /** @example USD */
            currency: Record<string, never> | null;
            /** @example 2024-01-01T00:00:00.000Z */
            payment_date: Record<string, never>;
            /** @example Initial */
            payment_type: Record<string, never> | null;
            /**
             * Format: date-time
             * @example 2024-01-01T00:00:00.000Z
             */
            created_at: string;
            /**
             * Format: date-time
             * @example 2024-01-01T00:00:00.000Z
             */
            updated_at: string;
        };
        DataPaymentsListResponseDto: {
            data: components["schemas"]["PrimerDataPaymentResponseDto"][];
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 100 */
            total: number;
            /** @example 10 */
            total_pages: number;
        };
        DataTransactionResponseDto: {
            /** @example 1 */
            id: number;
            /** @example txn_123456789 */
            external_txn_id: string;
            /** @example 2024-01-01T00:00:00.000Z */
            transaction_date: Record<string, never>;
            /** @example 123 */
            payment_id: number;
            /** @example pay_123456789 */
            payment_external_id: string;
            /**
             * Format: date-time
             * @example 2024-01-01T00:00:00.000Z
             */
            created_at: string;
            /**
             * Format: date-time
             * @example 2024-01-01T00:00:00.000Z
             */
            updated_at: string;
        };
        DataTransactionsListResponseDto: {
            data: components["schemas"]["DataTransactionResponseDto"][];
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 100 */
            total: number;
            /** @example 10 */
            total_pages: number;
        };
        DataRefundResponseDto: {
            /** @example 1 */
            id: number;
            /** @example ORD-123456 */
            order_id: string;
            /** @example ref_123456789 */
            external_id: string;
            /** @example 100.5 */
            amount: number;
            /** @example USD */
            currency: string;
            /** @example completed */
            status: string;
            /** @example Refund processed successfully */
            message: string | null;
            /**
             * Format: date-time
             * @example 2024-01-01T00:00:00.000Z
             */
            created_at: string;
        };
        DataRefundsListResponseDto: {
            data: components["schemas"]["DataRefundResponseDto"][];
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 100 */
            total: number;
            /** @example 10 */
            total_pages: number;
        };
        DataFallbackReportItemDto: {
            /** @example pay_123456789 */
            payment_id: string;
            /** @example 2024-01-15 */
            date: string;
            /** @example 1000 */
            amount: number;
            /** @example USD */
            currency: string;
            /** @example ADYEN */
            psp1_name: string;
            /** @example DECLINED */
            psp1_status: string;
            /** @example STRIPE */
            psp2_name?: string;
            /** @example SETTLED */
            psp2_status?: string;
            /** @example PAYPAL */
            psp3_name?: string;
            /** @example AUTHORIZED */
            psp3_status?: string;
            /** @example SQUARE */
            psp4_name?: string;
            /** @example FAILED */
            psp4_status?: string;
            /** @example BRAINTREE */
            psp5_name?: string;
            /** @example SETTLING */
            psp5_status?: string;
        };
        DataFallbackReportListResponseDto: {
            data: components["schemas"]["DataFallbackReportItemDto"][];
        };
        DataFallbackReportCsvResponseDto: {
            /**
             * Format: binary
             * @description CSV file content as binary data
             * @example Payment ID,Date,Amount,Currency,PSP 1,PSP 1 Status,PSP 2,PSP 2 Status
             *     pay_123,2024-01-15,1000,USD,ADYEN,DECLINED,STRIPE,SETTLED
             */
            data: string;
        };
        DataExportCsvSuccessResponseDto: {
            /** @example success */
            status: string;
            /** @example Payments exported successfully */
            message: string;
        };
        DataExportCsvErrorResponseDto: {
            /** @example error */
            status: string;
            /** @example Start date cannot be greater than end date */
            message: string;
        };
        PaypalPaymentCreateSessionRequestDto: {
            /** @description Unique Customer ID for the transaction. */
            referenceId: string;
            /** @description Currency code. */
            currency: string;
            /** @description Amount to charge. */
            amount: number;
            /** @description Customer email address. */
            email: string;
            /** @description Country code ISO 3166-1 alpha-2. */
            countryCode: string;
            paymentDescription: string;
            /**
             * @description Optional metadata for the transaction.
             * @example {
             *       "orderId": "123",
             *       "customerId": "456"
             *     }
             */
            metaData?: {
                [key: string]: unknown;
            };
            /** @description FOR PAYPAL NOT USED, JUST PART OF COMMON INTERFACE */
            clientToken?: string;
        };
        PaymentSourcePaypalAttributesVault: {
            /** @description Vault ID */
            id: string;
            /** @description Vault status */
            status: string;
        };
        PaymentSourcePaypalAttributes: {
            /** @description Vault details */
            vault: components["schemas"]["PaymentSourcePaypalAttributesVault"];
        };
        PaymentSourcePaypal: {
            attributes: components["schemas"]["PaymentSourcePaypalAttributes"];
        };
        PaymentSource: {
            paypal: components["schemas"]["PaymentSourcePaypal"];
        };
        PaypalOrderDetailsResponseDto: {
            /** @description Order ID */
            id: string;
            /** @description Order intent */
            intent: string;
            /** @description Order status */
            status: string;
            payment_source: components["schemas"]["PaymentSource"];
            /**
             * @description The time the authorization was created (ISO 8601 format)
             * @example 2025-09-10T12:00:00Z
             */
            create_time: string;
        };
        PaypalTransactionFetchRequestDto: {
            /**
             * @description Start date (ISO 8601 format: YYYY-MM-DDTHH:mm:ssZ)
             * @example 2025-08-01T00:00:00Z
             */
            startDate: string;
            /**
             * @description End date (ISO 8601 format: YYYY-MM-DDTHH:mm:ssZ)
             * @example 2025-08-02T23:59:59Z
             */
            endDate: string;
            /**
             * @description Optional transaction ID to filter by
             * @example 9GS80322P28628837
             */
            transactionId?: string;
            /**
             * @description Indicates whether the response includes only balance-impacting transactions or all transactions
             * @enum {string}
             */
            balanceAffectingRecordsOnly?: "Y" | "N";
            /**
             * @description Optional transaction status to filter by
             * @enum {string}
             */
            transaction_status?: "D" | "P" | "S" | "V";
            /** @description Filters the transactions in the response by a PayPal transaction event code */
            transaction_type?: string;
        };
        PaypalPayerInfoDto: {
            /** @example Z5GXXXXWTTNPS */
            account_id: string;
            /** @example johdoe@example.com */
            email_address: string;
            /**
             * @example {
             *       "country_code": "1",
             *       "national_number": "4089027107"
             *     }
             */
            phone_number?: Record<string, never>;
            /** @example N */
            address_status?: string;
            /** @example Y */
            payer_status?: string;
            /**
             * @example {
             *       "given_name": "John",
             *       "surname": "Doe",
             *       "alternate_full_name": "John Doe"
             *     }
             */
            payer_name?: Record<string, never>;
            /** @example US */
            country_code?: string;
        };
        PaypalTransactionRawResponseDto: {
            /** @example 9GS00022P28620007 */
            transaction_id?: string;
            /** @example COMPLETED */
            transaction_status?: string;
            /**
             * @example {
             *       "value": "50.00",
             *       "currency_code": "USD"
             *     }
             */
            transaction_amount?: Record<string, never>;
            payer_info: components["schemas"]["PaypalPayerInfoDto"];
        };
        PaypalTransactionFetchResponseDto: {
            /** @example success */
            status: string;
            /** @example Transactions fetched and stored successfully! */
            message: string;
            data: components["schemas"]["PaypalTransactionResponseDto"][] | null;
        };
        AuthorizationSearchQueryDto: {
            /**
             * @description Page number
             * @default 1
             * @example 1
             */
            page: string;
            /**
             * @description Number of items per page
             * @default 10
             * @example 10
             */
            limit: string;
            /** @description Quick Search field */
            quickSearch?: string;
            /**
             * @description Search by externalId
             * @example auth_001
             */
            externalId?: string;
            /**
             * @description Search by expiresIn days
             * @example 15
             */
            expiresIn?: string;
            /**
             * @description Search by status
             * @example success
             */
            status?: string;
            /**
             * @description Sort by field
             * @example createdAt
             */
            sortBy?: string;
            /**
             * @description Sort order
             * @example DESC
             */
            sortOrder?: string;
        };
        CaptureResponseDto: {
            /**
             * @description Primary ID of the capture record
             * @example 1
             */
            id: number;
            /**
             * @description External identifier for the capture entry
             * @example CAP-001-EXTERNAL
             */
            externalId: string;
            /**
             * @description Stored response/data returned from a payment provider
             * @example {
             *       "status": "COMPLETED",
             *       "amount": {
             *         "value": "19.99",
             *         "currency_code": "USD"
             *       },
             *       "payer_info": {
             *         "email": "customer@example.com",
             *         "country_code": "US"
             *       },
             *       "transaction_id": "83HSKJ29DHSKJ2"
             *     }
             */
            data: Record<string, never> | null;
            /**
             * Format: date-time
             * @description Timestamp when the record was created
             * @example 2025-11-10T06:38:51.000Z
             */
            createdAt: string;
            /**
             * Format: date-time
             * @description Timestamp when the record was last updated
             * @example 2025-11-10T06:38:51.000Z
             */
            updatedAt: string;
        };
        CaptureListResponseDto: {
            /** @example 4 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 1 */
            limit: number;
            /** @example 1 */
            totalPages: number;
            data: components["schemas"]["CaptureResponseDto"][];
        };
        PaypalCaptureV1AmountDto: {
            /**
             * @description Currency code in ISO 4217 format
             * @example USD
             */
            currency_code: string;
            /**
             * @description Monetary value
             * @example 100.00
             */
            value: string;
        };
        PaypalCaptureV1SellerProtectionDto: {
            /**
             * @description Seller protection status
             * @example ELIGIBLE
             */
            status: string;
            /**
             * @description Categories of disputes covered under seller protection
             * @example [
             *       "ITEM_NOT_RECEIVED",
             *       "UNAUTHORIZED_TRANSACTION"
             *     ]
             */
            dispute_categories: string[];
        };
        PaypalCaptureV1SellerReceivableBreakdownDto: {
            /** @description Gross amount captured */
            gross_amount: components["schemas"]["PaypalCaptureV1AmountDto"];
            /** @description PayPal fee amount */
            paypal_fee: components["schemas"]["PaypalCaptureV1AmountDto"];
            /** @description Net amount after fees */
            net_amount: components["schemas"]["PaypalCaptureV1AmountDto"];
        };
        PaypalCaptureV1RelatedIdsDto: Record<string, never>;
        PaypalCaptureV1SupplementaryDataDto: {
            /** @description Related identifiers container */
            related_ids: components["schemas"]["PaypalCaptureV1RelatedIdsDto"];
        };
        PaypalCaptureV1PayeeDto: {
            /**
             * @description Payee email address
             * @example sb-pfbjo24475123@business.example.com
             */
            email_address: string;
            /**
             * @description PayPal merchant identifier
             * @example D6P9S9DKA57WS
             */
            merchant_id: string;
        };
        PaypalCaptureV1LinkDto: {
            /**
             * @description Target URL for the action
             * @example https://api.sandbox.paypal.com/v2/payments/captures/2E9198812M925880F
             */
            href: string;
            /**
             * @description Relation of the link to the resource
             * @example self
             */
            rel: string;
            /**
             * @description HTTP method to be used with the link
             * @example GET
             */
            method: string;
        };
        PaypalCaptureV1ResponseDto: {
            /**
             * @description Capture identifier
             * @example 2E9198812M925880F
             */
            id: string;
            /** @description Captured amount */
            amount: components["schemas"]["PaypalCaptureV1AmountDto"];
            /**
             * @description Whether this is the final capture for the authorization
             * @example true
             */
            final_capture: boolean;
            /** @description Seller protection information */
            seller_protection: components["schemas"]["PaypalCaptureV1SellerProtectionDto"];
            /** @description Breakdown of the amounts receivable by the seller */
            seller_receivable_breakdown: components["schemas"]["PaypalCaptureV1SellerReceivableBreakdownDto"];
            /**
             * @description Invoice identifier associated with the capture
             * @example 2025-10-250813
             */
            invoice_id?: string;
            /**
             * @description Invoice identifier associated with the capture
             * @example 2025-10-250813
             */
            custom_id?: string;
            /**
             * @description Capture status
             * @example COMPLETED
             */
            status: string;
            /** @description Supplementary data, including related IDs */
            supplementary_data: components["schemas"]["PaypalCaptureV1SupplementaryDataDto"];
            /** @description Information about the payee */
            payee: components["schemas"]["PaypalCaptureV1PayeeDto"];
            /**
             * @description Creation time in RFC 3339 format
             * @example 2025-10-25T05:13:24Z
             */
            create_time: string;
            /**
             * @description Last update time in RFC 3339 format
             * @example 2025-10-25T05:13:24Z
             */
            update_time: string;
            /** @description HATEOAS links related to the capture */
            links: components["schemas"]["PaypalCaptureV1LinkDto"][];
        };
        CaptureDetailResponseDto: {
            /** @example Capture retrieved successfully */
            message: string;
            capture: components["schemas"]["CaptureResponseDto"];
        };
        PaypalCommonAmountDto: {
            /**
             * @description The currency code of the amount
             * @example USD
             */
            currency_code: string;
            /**
             * @description The value of the amount
             * @example 100.00
             */
            value: string;
        };
        PaypalCaptureV1RefundDto: {
            amount?: components["schemas"]["PaypalCommonAmountDto"];
        };
        PaypalCaptureV1RefundSellerPayableBreakdownDto: {
            /**
             * @description Gross amount of the original capture/payment.
             * @example {
             *       "currency_code": "USD",
             *       "value": "100.00"
             *     }
             */
            gross_amount: components["schemas"]["PaypalCommonAmountDto"];
            /**
             * @description PayPal processing fee for the original transaction.
             * @example {
             *       "currency_code": "USD",
             *       "value": "3.49"
             *     }
             */
            paypal_fee: components["schemas"]["PaypalCommonAmountDto"];
            /**
             * @description Net amount credited to the seller after fees.
             * @example {
             *       "currency_code": "USD",
             *       "value": "96.51"
             *     }
             */
            net_amount: components["schemas"]["PaypalCommonAmountDto"];
            /**
             * @description Total amount refunded so far for the related capture/payment.
             * @example {
             *       "currency_code": "USD",
             *       "value": "100.00"
             *     }
             */
            total_refunded_amount: components["schemas"]["PaypalCommonAmountDto"];
        };
        PaypalCaptureV1RefundLinkDto: {
            /**
             * @description Target URL for the related action.
             * @example https://api.sandbox.paypal.com/v2/payments/refunds/7YS455436N518410M
             */
            href: string;
            /**
             * @description The relation of the link to the resource.
             * @example self
             */
            rel: string;
            /**
             * @description HTTP method to be used with the link.
             * @example GET
             */
            method: string;
        };
        PaypalCaptureV1RefundResponseDto: {
            /**
             * @description Refund identifier.
             * @example 7YS455436N518410M
             */
            id: string;
            /**
             * @description Refunded amount.
             * @example {
             *       "currency_code": "USD",
             *       "value": "100.00"
             *     }
             */
            amount: components["schemas"]["PaypalCommonAmountDto"];
            /** @description Breakdown of seller payable amounts for the original transaction and refunds. */
            seller_payable_breakdown: components["schemas"]["PaypalCaptureV1RefundSellerPayableBreakdownDto"];
            /**
             * @description Invoice identifier associated with the refund.
             * @example 2025-10-250813
             */
            invoice_id?: string;
            /**
             * @description Refund status.
             * @example COMPLETED
             */
            status: string;
            /**
             * @description Creation time in RFC 3339 format.
             * @example 2025-10-24T22:29:57-07:00
             */
            create_time: string;
            /**
             * @description Last update time in RFC 3339 format.
             * @example 2025-10-24T22:29:57-07:00
             */
            update_time: string;
            /**
             * @description HATEOAS links related to the refund.
             * @example [
             *       {
             *         "href": "https://api.sandbox.paypal.com/v2/payments/refunds/7YS455436N518410M",
             *         "rel": "self",
             *         "method": "GET"
             *       },
             *       {
             *         "href": "https://api.sandbox.paypal.com/v2/payments/captures/2E9198812M925880F",
             *         "rel": "up",
             *         "method": "GET"
             *       }
             *     ]
             */
            links: components["schemas"]["PaypalCaptureV1RefundLinkDto"][];
        };
        RefundListResponseDto: {
            /** @example 4 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 1 */
            limit: number;
            /** @example 1 */
            totalPages: number;
            refunds: components["schemas"]["RefundResponseDto"][];
        };
        PaypalMoneyDto: {
            currency_code: string;
            value: string;
        };
        PaypalSellerPayableBreakdownDto: {
            gross_amount: components["schemas"]["PaypalMoneyDto"];
            paypal_fee: components["schemas"]["PaypalMoneyDto"];
            net_amount: components["schemas"]["PaypalMoneyDto"];
            total_refunded_amount: components["schemas"]["PaypalMoneyDto"];
        };
        PaypalRefundPayerDto: {
            email_address: string;
            merchant_id: string;
        };
        PaypalLinkDto: {
            href: string;
            rel: string;
            method: string;
        };
        PaypalRefundV1ResponseDto: {
            id: string;
            amount: components["schemas"]["PaypalMoneyDto"];
            seller_payable_breakdown: components["schemas"]["PaypalSellerPayableBreakdownDto"];
            invoice_id: string;
            status: string;
            /** @description RFC3339 timestamp */
            create_time: string;
            /** @description RFC3339 timestamp */
            update_time: string;
            payer: components["schemas"]["PaypalRefundPayerDto"];
            links: components["schemas"]["PaypalLinkDto"][];
        };
        RefundDetailResponseDto: {
            /** @example Refund retrieved successfully */
            message: string;
            refund: components["schemas"]["RefundResponseDto"];
        };
        AuthorizationResponseDto: {
            /** @example 1 */
            id: number;
            /** @example auth_001 */
            externalId: string;
            /**
             * @example {
             *       "amount": 100,
             *       "currency": "USD"
             *     }
             */
            data: Record<string, never> | null;
            /**
             * Format: date-time
             * @example 2025-10-27T09:22:26.835Z
             */
            createdAt: string;
            /**
             * Format: date-time
             * @example 2025-10-27T09:22:26.835Z
             */
            updatedAt: string;
        };
        AuthorizationListResponseDto: {
            data: components["schemas"]["AuthorizationResponseDto"][];
            /** @example 100 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 10 */
            totalPages: number;
        };
        PaypalAuthorizationV1AmountDto: {
            /**
             * @description Currency code in ISO 4217 format
             * @example USD
             */
            currency_code: string;
            /**
             * @description Monetary value
             * @example 100.00
             */
            value: string;
        };
        PaypalAuthorizationV1SellerProtectionDto: {
            /**
             * @description Seller protection status
             * @example ELIGIBLE
             */
            status: string;
            /**
             * @description Categories of disputes covered under seller protection
             * @example [
             *       "ITEM_NOT_RECEIVED",
             *       "UNAUTHORIZED_TRANSACTION"
             *     ]
             */
            dispute_categories: string[];
        };
        PaypalAuthorizationV1RelatedIdsDto: Record<string, never>;
        PaypalAuthorizationV1SupplementaryDataDto: {
            /** @description Related identifiers container */
            related_ids: components["schemas"]["PaypalAuthorizationV1RelatedIdsDto"];
        };
        PaypalAuthorizationV1PayeeDto: {
            /**
             * @description Payee email address
             * @example sb-pfbjo24475123@business.example.com
             */
            email_address: string;
            /**
             * @description PayPal merchant identifier
             * @example D6P9S9DKA57WS
             */
            merchant_id: string;
        };
        PaypalAuthorizationV1LinkDto: {
            /**
             * @description Target URL for the action
             * @example https://api.sandbox.paypal.com/v2/payments/authorizations/77548477XT579335T
             */
            href: string;
            /**
             * @description Relation of the link to the resource
             * @example self
             */
            rel: string;
            /**
             * @description HTTP method to be used with the link
             * @example GET
             */
            method: string;
        };
        PaypalAuthorizationV1ResponseDto: {
            /**
             * @description Authorization identifier
             * @example 77548477XT579335T
             */
            id: string;
            /**
             * @description Authorization status
             * @example CREATED
             */
            status: string;
            /** @description Authorized amount */
            amount: components["schemas"]["PaypalAuthorizationV1AmountDto"];
            /**
             * @description Invoice identifier associated with the authorization
             * @example 2025-10-250814
             */
            invoice_id?: string;
            /** @description Seller protection information */
            seller_protection: components["schemas"]["PaypalAuthorizationV1SellerProtectionDto"];
            /** @description Supplementary data, including related IDs */
            supplementary_data: components["schemas"]["PaypalAuthorizationV1SupplementaryDataDto"];
            /** @description Information about the payee */
            payee: components["schemas"]["PaypalAuthorizationV1PayeeDto"];
            /**
             * @description Authorization expiration time in RFC 3339 format
             * @example 2025-11-23T05:14:16Z
             */
            expiration_time: string;
            /**
             * @description Creation time in RFC 3339 format
             * @example 2025-10-25T05:14:16Z
             */
            create_time: string;
            /**
             * @description Last update time in RFC 3339 format
             * @example 2025-10-25T05:14:16Z
             */
            update_time: string;
            /** @description HATEOAS links related to the authorization */
            links: components["schemas"]["PaypalAuthorizationV1LinkDto"][];
        };
        PaypalAuthorizationV1VoidAmountDto: {
            /**
             * @description Currency code in ISO 4217 format
             * @example USD
             */
            currency_code: string;
            /**
             * @description Monetary value
             * @example 100.00
             */
            value: string;
        };
        PaypalAuthorizationV1VoidSellerProtectionDto: {
            /**
             * @description Seller protection status
             * @example ELIGIBLE
             */
            status: string;
            /**
             * @description Categories of disputes covered under seller protection
             * @example [
             *       "ITEM_NOT_RECEIVED",
             *       "UNAUTHORIZED_TRANSACTION"
             *     ]
             */
            dispute_categories: string[];
        };
        PaypalAuthorizationV1VoidLinkDto: {
            /**
             * @description Target URL for the action
             * @example https://api.sandbox.paypal.com/v2/payments/authorizations/77548477XT579335T
             */
            href: string;
            /**
             * @description Relation of the link to the resource
             * @example self
             */
            rel: string;
            /**
             * @description HTTP method to be used with the link
             * @example GET
             */
            method: string;
        };
        PaypalAuthorizationV1VoidResponseDto: {
            /**
             * @description Authorization identifier
             * @example 77548477XT579335T
             */
            id: string;
            /**
             * @description Authorization status
             * @example VOIDED
             */
            status: string;
            /** @description Authorized amount */
            amount: components["schemas"]["PaypalAuthorizationV1VoidAmountDto"];
            /**
             * @description Invoice identifier associated with the authorization
             * @example 2025-10-250814
             */
            invoice_id?: string;
            /** @description Seller protection information */
            seller_protection: components["schemas"]["PaypalAuthorizationV1VoidSellerProtectionDto"];
            /**
             * @description Authorization expiration time in RFC 3339 format
             * @example 2025-11-22T21:14:16-08:00
             */
            expiration_time: string;
            /**
             * @description Creation time in RFC 3339 format
             * @example 2025-10-24T22:14:16-07:00
             */
            create_time: string;
            /**
             * @description Last update time in RFC 3339 format
             * @example 2025-10-24T23:03:03-07:00
             */
            update_time: string;
            /** @description HATEOAS links related to the authorization */
            links: components["schemas"]["PaypalAuthorizationV1VoidLinkDto"][];
        };
        PaypalAuthorizationV1CaptureDto: {
            amount?: components["schemas"]["PaypalCommonAmountDto"];
            /**
             * @description Whether this is the final capture
             * @example false
             */
            final_capture?: boolean;
        };
        PaypalAuthorizationV1CaptureAmountDto: {
            /**
             * @description Currency code in ISO 4217 format
             * @example USD
             */
            currency_code: string;
            /**
             * @description Monetary value
             * @example 100.00
             */
            value: string;
        };
        PaypalAuthorizationV1CaptureSellerProtectionDto: {
            /**
             * @description Seller protection status
             * @example ELIGIBLE
             */
            status: string;
            /**
             * @description Categories of disputes covered under seller protection
             * @example [
             *       "ITEM_NOT_RECEIVED",
             *       "UNAUTHORIZED_TRANSACTION"
             *     ]
             */
            dispute_categories: string[];
        };
        PaypalAuthorizationV1CaptureExchangeRateDto: Record<string, never>;
        PaypalAuthorizationV1CaptureSellerReceivableBreakdownDto: {
            /** @description Gross amount captured */
            gross_amount: components["schemas"]["PaypalAuthorizationV1CaptureAmountDto"];
            /** @description PayPal fee amount */
            paypal_fee: components["schemas"]["PaypalAuthorizationV1CaptureAmountDto"];
            /** @description Net amount after fees */
            net_amount: components["schemas"]["PaypalAuthorizationV1CaptureAmountDto"];
            /** @description Exchange rate details, present when currency conversion applies */
            exchange_rate: components["schemas"]["PaypalAuthorizationV1CaptureExchangeRateDto"];
        };
        PaypalAuthorizationV1CaptureLinkDto: {
            /**
             * @description Target URL for the action
             * @example https://api.sandbox.paypal.com/v2/payments/captures/0GR841716N089840Y
             */
            href: string;
            /**
             * @description Relation of the link to the resource
             * @example self
             */
            rel: string;
            /**
             * @description HTTP method to be used with the link
             * @example GET
             */
            method: string;
        };
        PaypalAuthorizationV1CaptureResponseDto: {
            /**
             * @description Capture identifier
             * @example 0GR841716N089840Y
             */
            id: string;
            /** @description Captured amount */
            amount: components["schemas"]["PaypalAuthorizationV1CaptureAmountDto"];
            /**
             * @description Whether this is the final capture for the authorization
             * @example true
             */
            final_capture: boolean;
            /** @description Seller protection information */
            seller_protection: components["schemas"]["PaypalAuthorizationV1CaptureSellerProtectionDto"];
            /** @description Breakdown of the amounts receivable by the seller */
            seller_receivable_breakdown: components["schemas"]["PaypalAuthorizationV1CaptureSellerReceivableBreakdownDto"];
            /**
             * @description Invoice identifier associated with the capture
             * @example 2025-10-15-09-08
             */
            invoice_id?: string;
            /**
             * @description Capture status
             * @example COMPLETED
             */
            status: string;
            /**
             * @description Creation time in RFC 3339 format
             * @example 2025-10-25T06:11:19Z
             */
            create_time: string;
            /**
             * @description Last update time in RFC 3339 format
             * @example 2025-10-25T06:11:19Z
             */
            update_time: string;
            /**
             * @description HATEOAS links related to the capture
             * @example [
             *       {
             *         "href": "https://api.sandbox.paypal.com/v2/payments/captures/0GR841716N089840Y",
             *         "rel": "self",
             *         "method": "GET"
             *       },
             *       {
             *         "href": "https://api.sandbox.paypal.com/v2/payments/captures/0GR841716N089840Y/refund",
             *         "rel": "refund",
             *         "method": "POST"
             *       },
             *       {
             *         "href": "https://api.sandbox.paypal.com/v2/payments/authorizations/160816582U576121J",
             *         "rel": "up",
             *         "method": "GET"
             *       }
             *     ]
             */
            links: components["schemas"]["PaypalAuthorizationV1CaptureLinkDto"][];
        };
        DisputesListResponseDto: {
            items: components["schemas"]["DisputeResponseDto"][];
            /** @example 1 */
            page: number;
            /** @example 20 */
            page_size: number;
            /** @example 50 */
            total_items: number;
            /** @example 3 */
            total_pages: number;
        };
        PaypalAuthorizationInfoResponseAmount: {
            /**
             * @description Currency code in ISO 4217 format
             * @example USD
             */
            currency_code: string;
            /**
             * @description Authorized amount value
             * @example 50.00
             */
            value: string;
        };
        PaypalAuthorizationInfoResponseDto: {
            /**
             * @description The PayPal authorization ID
             * @example AUTH-1234567890
             */
            id: string;
            /**
             * @description Current status of the authorization (e.g., CREATED, VOIDED, REAUTHORIZED)
             * @example CREATED
             */
            status: string;
            amount: components["schemas"]["PaypalAuthorizationInfoResponseAmount"];
            /**
             * @description Invoice ID associated with the authorization
             * @example 1234567890
             */
            invoice_id?: string;
            /**
             * @description Invoice ID associated with the authorization
             * @example 1234567890
             */
            custom_id?: string;
            /**
             * @description The time the authorization was created (ISO 8601 format)
             * @example 2025-09-10T12:00:00Z
             */
            create_time: string;
            /**
             * @description The time the authorization will expire (ISO 8601 format)
             * @example 2025-09-15T12:00:00Z
             */
            expiration_time: string;
        };
        PaypalPaymentCaptureRequestDto: {
            /**
             * @description Amount to capture (if different from authorized amount)
             * @example {
             *       "value": "1.00",
             *       "currency_code": "USD"
             *     }
             */
            amount?: Record<string, never>;
            /**
             * @description Invoice ID for tracking purposes
             * @example CaptureInvoice-10142024
             */
            invoice_id?: string;
            /**
             * @description Whether this is the final capture
             * @default false
             * @example false
             */
            final_capture: boolean;
        };
        PaypalCapturedPaymentRealatedIds: {
            /** @description Order ID, when captured by order */
            order_id?: string;
            /** @description Authorization ID, when captured by payment authorization */
            authorization_id?: string;
        };
        PaypalCapturedPaymentSupplementaryData: {
            /** @description Related IDs */
            related_ids: components["schemas"]["PaypalCapturedPaymentRealatedIds"];
        };
        PaypalCapturedPaymentAmount: {
            /**
             * @description Currency code in ISO 4217 format
             * @example USD
             */
            currency_code: string;
            /**
             * @description Authorized amount value
             * @example 50.00
             */
            value: string;
        };
        PaypalCapturedPaymentResponseDto: {
            id: string;
            /** @description Order ID */
            custom_id?: string;
            /** @description Order ID */
            invoice_id?: string;
            /** @description Status */
            status: string;
            /** @description Related IDs */
            supplementary_data: components["schemas"]["PaypalCapturedPaymentSupplementaryData"];
            /** @description Amount */
            amount: components["schemas"]["PaypalCapturedPaymentAmount"];
        };
        PaypalPaymentSaleResponseDto: {
            /** @description Capture ID */
            id: string;
            /** @description Payment state */
            state: string;
            /** @description Invoice number */
            invoice_number: string;
            /** @description Billing Agreement ID */
            billing_agreement_id: string;
        };
        PaypalUpsellChargeRequestDto: {
            /**
             * @description The ID of the original charge from which the token will be retrieved.
             * @example 2T5013402Y710833P
             */
            chargeId: string;
            /**
             * @description Payment intent for the upsell charge.
             * @example CAPTURE
             * @enum {string}
             */
            intent?: "CAPTURE" | "AUTHORIZE";
            /**
             * @description Your internal order identifier to associate with this upsell.
             * @example O-1234567890
             */
            orderId: string;
            /**
             * @description ISO 4217 currency code to charge in.
             * @example USD
             */
            currency: string;
            /**
             * @description Total amount to charge.
             * @example 49.99
             */
            total: number;
            /**
             * @description Description of the upsell charge.
             * @example Upsell: Premium support add-on
             */
            description: string;
            /**
             * @description Optional metadata for the transaction.
             * @example {
             *       "orderId": "123",
             *       "customerId": "456"
             *     }
             */
            metaData?: {
                [key: string]: unknown;
            };
        };
        PaypalUpsellChargeResponseDto: {
            success: boolean;
        };
        PaypalOrderV1CreateDto: {
            /**
             * @description The intent of the payment.
             * @example CAPTURE
             */
            intent?: string;
            /**
             * @description The currency of the payment.
             * @example USD
             */
            currency: string;
            /**
             * @description The total amount of the payment.
             * @example 100
             */
            total: number;
            /**
             * @description The ID of the order.
             * @example O-1234567890
             */
            orderId: string;
            /**
             * @description The URL to redirect to after the payment is canceled.
             * @example https://example.com/cancel
             */
            cancelUrl: string;
            /**
             * @description The URL to redirect to after the payment is successful.
             * @example https://example.com/success
             */
            successUrl: string;
            /**
             * @description The email of the customer.
             * @example artur+bot@netzet.com
             */
            email: string;
            /** @description A description of the order. */
            description?: string;
        };
        PaypalOrderV1CreateNameDto: {
            /**
             * @description Given name of the person.
             * @example John
             */
            given_name?: string;
            /**
             * @description Surname of the person.
             * @example Doe
             */
            surname?: string;
        };
        PaypalOrderV1CreateAddressDto: {
            /**
             * @description Two-character ISO 3166-1 country code.
             * @example US
             */
            country_code?: string;
        };
        PaypalOrderV1CreatePaymentSourcePaypalDto: {
            /**
             * @description The PayPal account email of the payer.
             * @example sb-brh2916464091@personal.example.com
             */
            email_address: string;
            /**
             * @description PayPal account ID of the payer
             * @example Z5G943HWTTNPS
             */
            account_id?: string;
            /**
             * @description Status of the PayPal account
             * @example VERIFIED
             */
            account_status?: string;
            /** @description Name of the payer */
            name?: components["schemas"]["PaypalOrderV1CreateNameDto"];
            /** @description Address of the payer */
            address?: components["schemas"]["PaypalOrderV1CreateAddressDto"];
        };
        PaypalOrderV1CreatePaymentSourceDto: {
            /** @description PayPal-specific payment source details. */
            paypal: components["schemas"]["PaypalOrderV1CreatePaymentSourcePaypalDto"];
        };
        PaypalOrderV1CreateAmountBreakdownDto: {
            /**
             * @description The total amount for all items in the order.
             * @example {
             *       "currency_code": "USD",
             *       "value": "100.00"
             *     }
             */
            item_total?: components["schemas"]["PaypalCommonAmountDto"];
        };
        PaypalOrderV1CreateAmountDto: {
            /**
             * @description Currency code in ISO 4217 format
             * @example USD
             */
            currency_code: string;
            /**
             * @description Monetary value for the purchase unit
             * @example 100.00
             */
            value: string;
            /** @description Detailed breakdown of the amount. */
            breakdown?: components["schemas"]["PaypalOrderV1CreateAmountBreakdownDto"];
        };
        PaypalOrderV1CreatePayeeDto: {
            /**
             * @description Payee email address
             * @example sb-pfbjo24475123@business.example.com
             */
            email_address: string;
            /**
             * @description PayPal merchant identifier
             * @example D6P9S9DKA57WS
             */
            merchant_id: string;
        };
        PaypalOrderV1CreateSupplementaryDataDto: {
            /**
             * @description Tax nexus data
             * @example []
             */
            tax_nexus?: string[];
        };
        PaypalOrderV1CreatePaymentsDto: {
            /** @description Captures associated with this purchase unit */
            captures?: components["schemas"]["PaypalCaptureV1ResponseDto"][];
            /** @description Authorizations associated with this purchase unit */
            authorizations?: components["schemas"]["PaypalAuthorizationV1ResponseDto"][];
        };
        PaypalOrderV1CreatePurchaseUnitDto: {
            /**
             * @description The API caller-provided external ID for the purchase unit.
             * @example default
             */
            reference_id: string;
            /** @description The amount breakdown for this purchase unit. */
            amount: components["schemas"]["PaypalOrderV1CreateAmountDto"];
            /** @description Payee information for this purchase unit. */
            payee: components["schemas"]["PaypalOrderV1CreatePayeeDto"];
            /**
             * @description Description for the purchase unit
             * @example Subscription
             */
            description?: string;
            /**
             * @description The API caller-provided custom ID for the purchase unit.
             * @example 9677a751-9578-4809-8098-a84c607f4129-7
             */
            custom_id?: string;
            supplementary_data?: components["schemas"]["PaypalOrderV1CreateSupplementaryDataDto"];
            payments?: components["schemas"]["PaypalOrderV1CreatePaymentsDto"];
        };
        PaypalOrderV1CreatePayerDto: {
            /** @description Name of the payer */
            name?: components["schemas"]["PaypalOrderV1CreateNameDto"];
            /**
             * @description The payer email address.
             * @example sb-brh2916464091@personal.example.com
             */
            email_address: string;
            /**
             * @description The PayPal-assigned payer ID.
             * @example Z5G943HWTTNPS
             */
            payer_id?: string;
            /** @description Payer address */
            address?: components["schemas"]["PaypalOrderV1CreateAddressDto"];
        };
        PaypalOrderV1CreateLinkDto: {
            /**
             * @description Target URL for the related action.
             * @example https://api.sandbox.paypal.com/v2/checkout/orders/0LH51088WX0596135
             */
            href: string;
            /**
             * @description The relation of the link to the resource.
             * @example self
             */
            rel: string;
            /**
             * @description HTTP method to be used with the link.
             * @example GET
             */
            method: string;
        };
        PaypalOrderV1CreateResponseDto: {
            /**
             * @description The ID of the created order.
             * @example 84165127YS077920D
             */
            id: string;
            /**
             * @description The intent to either capture or authorize payment.
             * @example CAPTURE
             */
            intent: string;
            /**
             * @description The status of the order.
             * @example COMPLETED
             */
            status: string;
            /** @description Payment source information used for the order. */
            payment_source: components["schemas"]["PaypalOrderV1CreatePaymentSourceDto"];
            /** @description An array of purchase units in the order. */
            purchase_units: components["schemas"]["PaypalOrderV1CreatePurchaseUnitDto"][];
            /** @description Information about the payer. */
            payer: components["schemas"]["PaypalOrderV1CreatePayerDto"];
            /**
             * @description Creation time in RFC 3339 format
             * @example 2025-11-18T12:17:09Z
             */
            create_time?: string;
            /**
             * @description Last update time in RFC 3339 format
             * @example 2025-11-18T12:17:10Z
             */
            update_time?: string;
            /**
             * @description HATEOAS links associated with the created order.
             * @example [
             *       {
             *         "href": "https://api.sandbox.paypal.com/v2/checkout/orders/84165127YS077920D",
             *         "rel": "self",
             *         "method": "GET"
             *       }
             *     ]
             */
            links: components["schemas"]["PaypalOrderV1CreateLinkDto"][];
        };
        PaypalOrderV1CreateFromTokenDto: {
            /**
             * @description The intent of the payment.
             * @example CAPTURE
             */
            intent?: string;
            /**
             * @description The currency of the payment.
             * @example USD
             */
            currency: string;
            /**
             * @description The total amount of the payment.
             * @example 100
             */
            total: number;
            /**
             * @description The ID of the order.
             * @example O-1234567890
             */
            orderId: string;
            /** @description A description of the order. */
            description?: string;
            /**
             * @description Saved vault token from PayPal.
             * @example XXXXXX
             */
            token: string;
        };
        PaypalOrderV1CreateFromSessionDto: {
            /**
             * @description The intent of the payment.
             * @example CAPTURE
             */
            intent?: string;
            /**
             * @description The URL to redirect to after the payment is canceled.
             * @example https://example.com/cancel
             */
            cancelUrl: string;
            /**
             * @description The URL to redirect to after the payment is successful.
             * @example https://example.com/success
             */
            successUrl: string;
            /** @description A description of the order. */
            description?: string;
        };
        OrderResponseDto: {
            /** @example 1 */
            id: number;
            /** @example order_001 */
            externalId: string;
            /**
             * @example {
             *       "amount": 200,
             *       "currency": "USD",
             *       "status": "completed"
             *     }
             */
            data: Record<string, never> | null;
            /**
             * Format: date-time
             * @example 2025-10-27T09:22:26.835Z
             */
            createdAt: string;
            /**
             * Format: date-time
             * @example 2025-10-27T09:22:26.835Z
             */
            updatedAt: string;
        };
        OrderListResponseDto: {
            data: components["schemas"]["OrderResponseDto"][];
            /** @example 100 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 10 */
            totalPages: number;
        };
        PaypalOrderV1ResponseDto: {
            /**
             * @description The ID of the created order.
             * @example 84165127YS077920D
             */
            id: string;
            /**
             * @description The intent to either capture or authorize payment.
             * @example CAPTURE
             */
            intent: string;
            /**
             * @description The status of the order.
             * @example COMPLETED
             */
            status: string;
            /** @description Payment source information used for the order. */
            payment_source: components["schemas"]["PaypalOrderV1CreatePaymentSourceDto"];
            /** @description An array of purchase units in the order. */
            purchase_units: components["schemas"]["PaypalOrderV1CreatePurchaseUnitDto"][];
            /** @description Information about the payer. */
            payer: components["schemas"]["PaypalOrderV1CreatePayerDto"];
            /**
             * @description Creation time in RFC 3339 format
             * @example 2025-11-18T12:17:09Z
             */
            create_time?: string;
            /**
             * @description Last update time in RFC 3339 format
             * @example 2025-11-18T12:17:10Z
             */
            update_time?: string;
            /**
             * @description HATEOAS links associated with the created order.
             * @example [
             *       {
             *         "href": "https://api.sandbox.paypal.com/v2/checkout/orders/84165127YS077920D",
             *         "rel": "self",
             *         "method": "GET"
             *       }
             *     ]
             */
            links: components["schemas"]["PaypalOrderV1CreateLinkDto"][];
        };
        PaypalPaymentV1V1PaymentCreateDto: {
            /**
             * @description The intent of the payment.
             * @example sale
             */
            intent?: string;
            /**
             * @description The ID of the billing agreement.
             * @example B-1234567890
             */
            agreementId: string;
            /**
             * @description The currency of the payment.
             * @example USD
             */
            currency: string;
            /**
             * @description The total amount of the payment.
             * @example 100
             */
            total: number;
            /**
             * @description The description of the payment.
             * @example Payment for order 123
             */
            description: string;
            /**
             * @description The ID of the order.
             * @example O-1234567890
             */
            orderId: string;
        };
        FundingBillingDto: {
            billing_agreement_id: string;
        };
        FundingInstrumentDto: {
            /** @description Billing agreement details for the instrument. */
            billing: components["schemas"]["FundingBillingDto"];
        };
        PayerDto: {
            payment_method: string;
            status: string;
            payer_info: components["schemas"]["PayerInfoDto"];
            funding_instruments: components["schemas"]["FundingInstrumentDto"][];
        };
        AmountDetailsDto: {
            subtotal: string;
            shipping: string;
            insurance: string;
            handling_fee: string;
            shipping_discount: string;
            discount: string;
        };
        AmountDto: {
            total: string;
            currency: string;
            details: components["schemas"]["AmountDetailsDto"];
        };
        PayeeDto: {
            merchant_id: string;
            email: string;
        };
        ItemDto: {
            name: string;
            sku: string;
            description: string;
            price: string;
            currency: string;
            tax: string;
            quantity: number;
            image_url: string;
        };
        ItemListDto: {
            items: components["schemas"]["ItemDto"][];
        };
        RelatedResourceDto: {
            sale?: components["schemas"]["PaypalCaptureV1ResponseDto"];
            authorization?: components["schemas"]["PaypalAuthorizationV1ResponseDto"];
        };
        PaypalPaymentV1V1PaymentCreateResponseDto: {
            /** @example PAYID-ND53H7Q6BD589953P7945052 */
            id: string;
            /** @example sale */
            intent: string;
            /** @example approved */
            state: string;
            payer: components["schemas"]["PayerDto"];
            transactions: components["schemas"]["TransactionDto"][];
            /** @description ISO-8601 creation time. */
            create_time: string;
            /** @description ISO-8601 update time. */
            update_time: string;
            links: components["schemas"]["PaypalLinkDto"][];
        };
        PaypalPaymentV1V1PaymentCreateFromSessionDto: {
            /**
             * @description The ID of the agrement.
             * @example B-1234567890
             */
            agreementId: string;
        };
        PaypalActionLogResponseDto: {
            /**
             * @description The ID of the action log.
             * @example 1
             */
            id: number;
            /**
             * @description The reference ID of the action log.
             * @example some-reference-id
             */
            referenceId: Record<string, never>;
            /**
             * @description The URL of the action.
             * @example /api/v1/some-action
             */
            actionUrl: string;
            /**
             * @description The body of the action.
             * @example {
             *       "key": "value"
             *     }
             */
            body: Record<string, never>;
            /**
             * @description The response of the action.
             * @example {
             *       "success": true
             *     }
             */
            response: Record<string, never>;
            /**
             * Format: date-time
             * @description The creation date of the action log.
             * @example 2021-01-01T00:00:00.000Z
             */
            createdAt: string;
        };
        PaypalActionLogPaginatedResponseDto: {
            data: components["schemas"]["PaypalActionLogResponseDto"][];
            /** @example 100 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 10 */
            totalPages: number;
        };
        PaypalOrderRequestResponseDto: {
            /**
             * @description The ID of the order request.
             * @example 1
             */
            id: number;
            /**
             * @description The UUID of the order request.
             * @example f47ac10b-58cc-4372-a567-0e02b2c3d479
             */
            uuid: string;
            /**
             * @description The body of the order request.
             * @example {
             *       "key": "value"
             *     }
             */
            body: Record<string, never>;
            /**
             * Format: date-time
             * @description The creation date of the order request.
             * @example 2021-01-01T00:00:00.000Z
             */
            created_at: string;
        };
        PaypalOrderRequestPaginatedResponseDto: {
            data: components["schemas"]["PaypalOrderRequestResponseDto"][];
            /** @example 100 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 10 */
            totalPages: number;
        };
        PaypalRefundsLogResponseDto: {
            /**
             * @description The ID of the refund log.
             * @example 1
             */
            id: number;
            /**
             * @description The order ID of the refund log.
             * @example some-order-id
             */
            orderId: string;
            /**
             * @description The transaction ID of the refund log.
             * @example some-transaction-id
             */
            transactionId: string;
            /**
             * @description The amount of the refund.
             * @example 100
             */
            amount: number;
            /**
             * @description The currency of the refund.
             * @example USD
             */
            currency: string;
            /**
             * @description The status of the refund.
             * @example success
             */
            status: string;
            /**
             * @description The message of the refund.
             * @example Refund successful
             */
            message: string;
            /**
             * Format: date-time
             * @description The creation date of the refund log.
             * @example 2021-01-01T00:00:00.000Z
             */
            createdAt: string;
        };
        PaypalRefundsLogPaginatedResponseDto: {
            data: components["schemas"]["PaypalRefundsLogResponseDto"][];
            /** @example 100 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 10 */
            totalPages: number;
        };
        PaypalTransactionPaginatedResponseDto: {
            data: components["schemas"]["PaypalTransactionResponseDto"][];
            /** @example 100 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 10 */
            totalPages: number;
        };
        PaypalDisputeDataResponseDto: {
            /** @example 1 */
            id: number;
            /** @example PP-D-208454 */
            disputeId: string;
            /** @example RESOLVED */
            state: Record<string, never> | null;
            /** @example CHARGEBACK */
            stage: Record<string, never> | null;
            /** @example 16 */
            disputedAmountValue: Record<string, never> | null;
            /** @example USD */
            disputedAmountCurrency: Record<string, never> | null;
            /** @example MERCHANDISE_OR_SERVICE_NOT_RECEIVED */
            reason: Record<string, never> | null;
            /** @description Original raw PayPal response payload */
            rawResponse: {
                [key: string]: unknown;
            } | null;
            /**
             * Format: date-time
             * @example 2025-09-25T17:34:47.000Z
             */
            createdAt: string;
            /**
             * Format: date-time
             * @example 2025-09-25T17:34:47.000Z
             */
            updatedAt: string;
        };
        PaypalDisputePaginatedResponseDto: {
            data: components["schemas"]["PaypalDisputeDataResponseDto"][];
            /** @example 100 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 10 */
            totalPages: number;
        };
        PaypalAuthorizationCaptureLogDataResponseDto: {
            /** @example 1 */
            id: number;
            /**
             * Format: date-time
             * @example 2025-09-25T17:34:47.000Z
             */
            createdAt: string;
            /** @example 9GS80322PL908563T */
            transactionId: string;
            /**
             * @description Log status: skip, success, error
             * @example success
             */
            status: string;
            /**
             * @description Details about the capture attempt
             * @example {
             *       "paypal_capture_id": "CAP-12345",
             *       "message": "Capture successful"
             *     }
             */
            details: {
                [key: string]: unknown;
            } | null;
        };
        PaypalAuthorizationCaptureLogPaginatedResponseDto: {
            data: components["schemas"]["PaypalAuthorizationCaptureLogDataResponseDto"][];
            /** @example 100 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 10 */
            totalPages: number;
        };
        BillingAgreementResponseDto: {
            /**
             * @description Primary ID of the billing agreement
             * @example 1
             */
            id: number;
            /**
             * @description External PayPal Billing Agreement ID
             * @example BILL-AG-001
             */
            externalId: string;
            /**
             * @description Stored PayPal billing agreement data returned from PayPal
             * @example {
             *       "plan": "Premium",
             *       "payer": {
             *         "email": "user1@example.com"
             *       },
             *       "status": "ACTIVE"
             *     }
             */
            data: Record<string, never> | null;
            /**
             * Format: date-time
             * @description Creation timestamp (ISO string)
             * @example 2025-11-10T06:38:51.000Z
             */
            createdAt: string;
            /**
             * Format: date-time
             * @description Last updated timestamp (ISO string)
             * @example 2025-11-10T06:38:51.000Z
             */
            updatedAt: string;
        };
        BillingAgreementListResponseDto: {
            /** @example 4 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 1 */
            totalPages: number;
            data: components["schemas"]["BillingAgreementResponseDto"][];
        };
        PaypalBillingAgreementV1CreateDto: {
            /**
             * @description The description of the billing agreement.
             * @example Billing agreement for order 123
             */
            description: string;
            /**
             * @description Redirect URL after the user approves the billing agreement.
             * @example https://example.com/success
             */
            returnUrl: string;
            /**
             * @description Redirect URL after the user cancels the billing agreement.
             * @example https://example.com/cancel
             */
            cancelUrl: string;
            /**
             * @description Indicates whether to skip the shipping address.
             * @default false
             */
            skipShippingAddress: boolean;
        };
        PaypalBillingAgreementLinkDto: {
            /**
             * @description Target URL for the related action.
             * @example https://www.sandbox.paypal.com/agreements/approve?ba_token=BA-7F476943VW515780U
             */
            href: string;
            /**
             * @description The relation of the link to the resource.
             * @example approval_url
             */
            rel: string;
            /**
             * @description HTTP method to be used with the link.
             * @example POST
             */
            method: string;
        };
        PaypalBillingAgreementV1CreateResponseDto: {
            /**
             * @description Token identifier for the billing agreement approval.
             * @example BA-7F476943VW515780U
             */
            token_id: string;
            /**
             * @description HATEOAS links relevant to the created billing agreement.
             * @example [
             *       {
             *         "href": "https://www.sandbox.paypal.com/agreements/approve?ba_token=BA-7F476943VW515780U",
             *         "rel": "approval_url",
             *         "method": "POST"
             *       },
             *       {
             *         "href": "https://api-m.sandbox.paypal.com/v1/billing-agreements/BA-7F476943VW515780U/agreements",
             *         "rel": "self",
             *         "method": "POST"
             *       }
             *     ]
             */
            links: components["schemas"]["PaypalBillingAgreementLinkDto"][];
        };
        PaypalBillingAgreementV1CreateFromSessionDto: {
            /**
             * @description Redirect URL after the user approves the billing agreement.
             * @example https://example.com/success
             */
            returnUrl: string;
            /**
             * @description Redirect URL after the user cancels the billing agreement.
             * @example https://example.com/cancel
             */
            cancelUrl: string;
        };
        PaypalPayeeInfoDto: {
            /**
             * @description Email of the payee (merchant).
             * @example sb-pfbjo24475123@business.example.com
             */
            email: string;
        };
        PaypalMerchantDto: {
            payee_info: components["schemas"]["PaypalPayeeInfoDto"];
        };
        PaypalPayerDto: {
            payer_info: components["schemas"]["PaypalPayerInfoDto"];
        };
        PaypalShippingAddressDto: {
            /** @example John Doe */
            recipient_name: string;
            /** @example 1 Main St */
            line1: string;
            /** @example San Jose */
            city: string;
            /** @example CA */
            state: string;
            /** @example US */
            country_code: string;
            /** @example 95131 */
            postal_code: string;
        };
        PaypalPlanMerchantPreferencesDto: {
            /**
             * @description Webhook notification URL.
             * @example https://webhook.site/8ad1f0b0-1aed-46eb-a2c9-2ce345c3c7e6
             */
            notify_url: string;
            /** @example INSTANT */
            accepted_pymt_type: string;
            /** @example false */
            multi_factor_activation: boolean;
            /** @example false */
            req_billing_address: boolean;
        };
        PaypalPlanDto: {
            /** @example MERCHANT_INITIATED_BILLING */
            type: string;
            merchant_preferences: components["schemas"]["PaypalPlanMerchantPreferencesDto"];
        };
        PaypalBillingAgreementV1ResponseDto: {
            /** @example B-18G27807A0987670C */
            id: string;
            /** @example ACTIVE */
            state: string;
            /** @example Billing agreement for order 123 */
            description: string;
            merchant: components["schemas"]["PaypalMerchantDto"];
            payer: components["schemas"]["PaypalPayerDto"];
            shipping_address?: components["schemas"]["PaypalShippingAddressDto"];
            plan: components["schemas"]["PaypalPlanDto"];
            /**
             * @description ISO 8601 creation timestamp.
             * @example 2025-10-24T15:50:16.000Z
             */
            create_time: string;
            /**
             * @description ISO 8601 last update timestamp.
             * @example 2025-10-24T15:50:16.000Z
             */
            update_time: string;
            /**
             * @description Additional agreement details provided by PayPal.
             * @example {}
             */
            agreement_details: Record<string, never>;
            links: components["schemas"]["PaypalBillingAgreementLinkDto"][];
        };
        BillingAgreementDetailesponseDto: {
            /** @example Billing agreement retrieved successfully */
            message: string;
            billingAggrement: components["schemas"]["BillingAgreementResponseDto"];
        };
        WebhookEventTypeDto: {
            /** @example * */
            name: string;
            /** @example ALL */
            description: string;
            /** @example ENABLED */
            status?: string;
        };
        WebhookLinkDto: {
            /** @example https://api.sandbox.paypal.com/v1/notifications/webhooks/95A389710X241893J */
            href: string;
            /** @example self */
            rel: string;
            /** @example GET */
            method: string;
        };
        WebhookDetailDto: {
            /** @example 95A389710X241893J */
            id: string;
            /** @example https://github.com/v1/webhook */
            url: string;
            event_types: components["schemas"]["WebhookEventTypeDto"][];
            links: components["schemas"]["WebhookLinkDto"][];
        };
        WebhookListResponseDto: {
            /** @example Webhook list retrieved successfully */
            message: string;
            webhooks: components["schemas"]["WebhookDetailDto"][];
        };
        StripeUploadDisputesSuccessResponseDto: {
            /**
             * @description Indicates that the request was successful.
             * @example true
             */
            success: boolean;
        };
        StripeBadRequestErrorDto: {
            /**
             * @description HTTP status code.
             * @example 400
             */
            statusCode: number;
            /**
             * @description List of error messages.
             * @example [
             *       "property must be a string"
             *     ]
             */
            message: string[];
            /**
             * @description Error message.
             * @example Bad Request
             */
            error: string;
        };
        StripeInternalServerErrorDto: {
            /**
             * @description HTTP status code.
             * @example 500
             */
            statusCode: number;
            /**
             * @description Error message.
             * @example Internal Server Error
             */
            message: string;
            /**
             * @description Error message.
             * @example Internal Server Error
             */
            error: string;
        };
        StripeEarlyFraudWarningRequestDto: {
            /**
             * @description Start date in YYYY-MM-DD or ISO 8601 format (e.g., 2025-08-01 or 2025-08-01T00:00:00Z)
             * @example 2025-08-01
             */
            startDate?: string;
            /**
             * @description End date in YYYY-MM-DD or ISO 8601 format (e.g., 2025-08-10 or 2025-08-10T23:59:59Z)
             * @example 2025-08-10
             */
            endDate?: string;
        };
        StripeEarlyFraudWarningSuccessResponseDto: {
            /**
             * @description Indicates whether the request was successful.
             * @example true
             */
            success: boolean;
            /**
             * @description Optional success or error message.
             * @example Fraud warnings synced successfully
             */
            message?: string;
            /**
             * @description Error message in case of failure.
             * @example Database error: duplicate key value
             */
            error?: string;
        };
        StripeChargeSyncRequestDto: {
            /**
             * @description Start date in YYYY-MM-DD or ISO 8601 format for fetching Stripe charges (e.g., 2025-08-01 or 2025-08-01T00:00:00Z)
             * @example 2025-08-01
             */
            startDate?: string;
            /**
             * @description End date in YYYY-MM-DD or ISO 8601 format for fetching Stripe charges (e.g., 2025-08-10 or 2025-08-10T23:59:59Z)
             * @example 2025-08-10
             */
            endDate?: string;
        };
        StripeChargeSyncSuccessResponseDto: {
            /**
             * @description Indicates that the charges sync request was successful.
             * @example true
             */
            success: boolean;
            /**
             * @description Optional success or error message.
             * @example Charges synced successfully
             */
            message?: string;
            /**
             * @description Error message in case of failure.
             * @example Database error: duplicate key value
             */
            error?: string;
        };
        StripeRefundSyncRequestDto: {
            /**
             * @description Start date in YYYY-MM-DD or ISO 8601 format for fetching Stripe refunds (e.g., 2025-08-01 or 2025-08-01T00:00:00Z)
             * @example 2025-08-01
             */
            startDate?: string;
            /**
             * @description End date in YYYY-MM-DD or ISO 8601 format for fetching Stripe refunds (e.g., 2025-08-10 or 2025-08-10T23:59:59Z)
             * @example 2025-08-10
             */
            endDate?: string;
        };
        StripeRefundSyncSuccessResponseDto: {
            /**
             * @description Indicates that the refunds sync request was successful.
             * @example true
             */
            success: boolean;
            /**
             * @description Optional success or error message.
             * @example Refunds synced successfully
             */
            message?: string;
            /**
             * @description Error message in case of failure.
             * @example Database error: duplicate key value
             */
            error?: string;
        };
        StripeChargeSearchRequestDto: {
            /**
             * @description Minimum amount in cents (e.g., 1500 for $15.00)
             * @example 1500
             */
            minAmount?: number;
            /**
             * @description Maximum amount in cents (e.g., 3000 for $30.00)
             * @example 3000
             */
            maxAmount?: number;
            /**
             * @description Last 4 digits of payment method card
             * @example 4242
             */
            last4?: string;
            /**
             * @description Filter by disputed status
             * @example true
             */
            disputed?: boolean;
            /**
             * @description Filter by refunded status
             * @example false
             */
            refunded?: boolean;
            /**
             * @description Start date in YYYY-MM-DD or ISO 8601 format for created range (e.g., 2025-08-01 or 2025-08-01T00:00:00Z)
             * @example 2025-08-01
             */
            startDate?: string;
            /**
             * @description End date in YYYY-MM-DD or ISO 8601 format for created range (e.g., 2025-08-10 or 2025-08-10T23:59:59Z)
             * @example 2025-08-10
             */
            endDate?: string;
        };
        StripeChargeSummaryDto: {
            /**
             * @description Charge ID
             * @example ch_1234567890
             */
            id: string;
            /**
             * @description Amount in cents
             * @example 2000
             */
            amount: number;
            /**
             * @description Currency code
             * @example usd
             */
            currency: string;
            /**
             * @description Whether the charge is disputed
             * @example false
             */
            disputed: boolean;
            /**
             * @description Whether the charge is refunded
             * @example false
             */
            refunded: boolean;
            /**
             * @description Creation timestamp
             * @example 1640995200
             */
            created: number;
            /** @description Metadata associated with the charge */
            metadata?: Record<string, never>;
        };
        StripeChargeSearchSuccessResponseDto: {
            /**
             * @description Indicates that the charges search request was successful
             * @example true
             */
            success: boolean;
            /** @description Array of charge summaries matching the search criteria */
            data: components["schemas"]["StripeChargeSummaryDto"][];
            /**
             * @description Total number of charges found and saved to database
             * @example 25
             */
            total_saved: number;
            /**
             * @description Indicates if there are more results available
             * @example false
             */
            has_more: boolean;
        };
        StripeDisputeSummaryDto: {
            /**
             * @description Dispute ID
             * @example dp_1234567890
             */
            id: string;
            /**
             * @description Disputed amount in cents
             * @example 5000
             */
            amount: number;
            /**
             * @description Currency code
             * @example usd
             */
            currency: string;
            /**
             * @description Current status of the dispute
             * @example needs_response
             */
            status: string;
            /**
             * @description Reason for the dispute
             * @example fraudulent
             */
            reason?: string | null;
            /**
             * @description Creation timestamp of the dispute
             * @example 1640995200
             */
            created: number;
            /**
             * @description Associated charge ID
             * @example ch_1234567890
             */
            chargeId?: string | null;
            /**
             * @description Associated payment intent ID
             * @example pi_1234567890
             */
            paymentIntent?: string | null;
        };
        StripeDisputesSyncSuccessResponseDto: {
            /**
             * @description Indicates that the disputes sync request was successful.
             * @example true
             */
            success: boolean;
            /**
             * @description Total number of disputes fetched and processed
             * @example 10
             */
            total: number;
            /** @description Array of dispute summaries fetched from Stripe */
            data: components["schemas"]["StripeDisputeSummaryDto"][];
        };
        StripeInternalServerErrorResponseDto: {
            /**
             * @description HTTP status code
             * @example 500
             */
            statusCode: number;
            /**
             * @description Error message
             * @example Stripe error: Something went wrong
             */
            message: string;
            /**
             * @description Error type
             * @example Internal Server Error
             */
            error: string;
        };
        StripeSyncSuccessResponseDto: {
            /**
             * @description Status of the sync operation
             * @example success
             */
            status: string;
            /**
             * @description Success message describing the operation
             * @example Disputes jobs enqueued
             */
            message: string;
        };
        StripeChargeResponseDto: {
            /**
             * @description The ID of the charge.
             * @example 1
             */
            id: number;
            /**
             * @description The Stripe charge ID.
             * @example ch_1234567890
             */
            sourceId: string;
            /**
             * @description The creation timestamp of the charge.
             * @example 1692942318
             */
            created: number;
            /**
             * @description True if the object exists in live mode; false if the object exists in test mode.
             * @example false
             */
            livemode: boolean;
            /**
             * @description Full Stripe charge object stored as JSON.
             * @example {
             *       "id": "ch_1234567890",
             *       "amount": 2000,
             *       "currency": "usd"
             *     }
             */
            data: Record<string, never>;
            /**
             * Format: date-time
             * @description The creation date of the charge record.
             * @example 2021-01-01T00:00:00.000Z
             */
            createdAt: string;
            /**
             * Format: date-time
             * @description The last update date of the charge record.
             * @example 2021-01-01T00:00:00.000Z
             */
            updatedAt: string;
        };
        StripeChargePaginatedResponseDto: {
            data: components["schemas"]["StripeChargeResponseDto"][];
            /** @example 100 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 10 */
            totalPages: number;
        };
        StripeDisputeResponseDto: {
            /**
             * @description The ID of the dispute.
             * @example 1
             */
            id: number;
            /**
             * @description The Stripe dispute ID.
             * @example du_1RqrpqHUCmnJBv5wT1EOPHlg
             */
            sourceId: string;
            /**
             * Format: date-time
             * @description The creation date of the dispute.
             * @example 2025-08-19T11:12:30.000Z
             */
            disputeCreatedUtc: string;
            /**
             * Format: date-time
             * @description The creation date of the original charge.
             * @example 2025-08-18T09:40:00.000Z
             */
            chargeCreatedUtc: string;
            /**
             * @description The amount of the dispute.
             * @example 100.50
             */
            disputeAmount: string;
            /**
             * @description The currency of the dispute.
             * @example USD
             */
            disputeCurrency: string;
            /**
             * @description The amount of the original charge.
             * @example 100.50
             */
            chargeAmount: string;
            /**
             * @description The currency of the original charge.
             * @example USD
             */
            chargeCurrencyChargeId: string;
            /**
             * @description The reason for the dispute.
             * @example fraudulent
             */
            reason: string;
            /**
             * @description The current status of the dispute.
             * @example needs_response
             */
            status: string;
            /**
             * @description Whether this is a Visa Rapid Dispute Resolution.
             * @example false
             */
            isVisaRapidDisputeResolution: boolean;
            /**
             * @description The payment intent ID associated with the dispute.
             * @example pi_3Lp7g22eZvKYlo2C7X9Y8Z7W
             */
            paymentIntent: string;
            /**
             * @description The charge ID associated with the dispute.
             * @example ch_3Lp7g22eZvKYlo2C1A2B3D4E
             */
            chargeId: string;
        };
        StripeDisputePaginatedResponseDto: {
            data: components["schemas"]["StripeDisputeResponseDto"][];
            /** @example 100 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 10 */
            totalPages: number;
        };
        StripeEarlyFraudWarningResponseDto: {
            /**
             * @description The ID of the early fraud warning.
             * @example 1
             */
            id: number;
            /**
             * @description The Stripe early fraud warning ID.
             * @example issfr_1Pb2dF2eZvKYlo2C5Z4Z4Z4Z
             */
            sourceId: string;
            /**
             * @description String representing the object's type.
             * @example radar.early_fraud_warning
             */
            object: string;
            /**
             * @description Whether the fraud warning is actionable.
             * @example true
             */
            actionable: boolean;
            /**
             * @description ID of the charge this fraud warning is for.
             * @example ch_3Pb2dF2eZvKYlo2C1Z4Z4Z4Z
             */
            charge: string;
            /**
             * @description Time at which the object was created. Measured in seconds since the Unix epoch.
             * @example 1672531199
             */
            created: number;
            /**
             * @description The type of fraud.
             * @example card_risk_level_elevated
             */
            fraudType: string;
            /**
             * @description Has the value true if the object exists in live mode or the value false if the object exists in test mode.
             * @example false
             */
            livemode: boolean;
            /**
             * Format: date-time
             * @description Timestamp of when the record was created in the database.
             * @example 2021-01-01T00:00:00.000Z
             */
            createdAt: string;
            /**
             * Format: date-time
             * @description Timestamp of when the record was last updated in the database.
             * @example 2021-01-01T00:00:00.000Z
             */
            updatedAt: string;
        };
        StripeEarlyFraudWarningPaginatedResponseDto: {
            data: components["schemas"]["StripeEarlyFraudWarningResponseDto"][];
            /** @example 100 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 10 */
            totalPages: number;
        };
        StripeRefundResponseDto: {
            /**
             * @description Internal database ID.
             * @example 1
             */
            id: number;
            /**
             * @description Stripe refund ID.
             * @example re_123
             */
            sourceId: string;
            /**
             * @description Time at which the refund was created on Stripe. Seconds since Unix epoch.
             * @example 1692942318
             */
            created: number;
            /**
             * @description True if the object exists in live mode; false if the object exists in test mode.
             * @example false
             */
            livemode: boolean;
            /** @description Full Stripe refund object stored as JSON. */
            data: Record<string, never>;
            /**
             * Format: date-time
             * @description Record creation timestamp.
             */
            createdAt: string;
            /**
             * Format: date-time
             * @description Record last update timestamp.
             */
            updatedAt: string;
        };
        StripeRefundPaginatedResponseDto: {
            data: components["schemas"]["StripeRefundResponseDto"][];
            /** @example 100 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 10 */
            totalPages: number;
        };
        StripeAuthRateReportResponseDto: {
            /**
             * @description Indicates that the auth rate report request was successful
             * @example true
             */
            success: boolean;
            /**
             * @description Authorization success rate percentage
             * @example 95.5
             */
            authRate: number;
            /**
             * @description Date range for the report
             * @example 2025-08-01 to 2025-08-10
             */
            dateRange: string;
        };
        StripeFraudDisputeRatesReportResponseDto: {
            /**
             * @description Indicates that the fraud/dispute rates report request was successful
             * @example true
             */
            success: boolean;
            /**
             * @description Early fraud rate percentage
             * @example 2.1
             */
            earlyFraudRate: number;
            /**
             * @description Dispute rate percentage
             * @example 1.8
             */
            disputeRate: number;
            /**
             * @description RDR (Rapid Dispute Resolution) rate percentage
             * @example 0.5
             */
            rdrRate: number;
            /**
             * @description Chargeback rate percentage
             * @example 1.3
             */
            chargebackRate: number;
            /**
             * @description Vamp rate percentage
             * @example 3.4
             */
            vampRate: number;
            /**
             * @description Date range for the report
             * @example 2025-08-01 to 2025-08-10
             */
            dateRange: string;
        };
        StripeRefundRateReportResponseDto: {
            /**
             * @description Indicates that the refund rate report request was successful
             * @example true
             */
            success: boolean;
            /**
             * @description Refund success rate percentage
             * @example 98.2
             */
            refundRate: number;
            /**
             * @description Date range for the report
             * @example 2025-08-01 to 2025-08-10
             */
            dateRange: string;
        };
        MetricDto: {
            /**
             * @description Count of records
             * @example 100
             */
            count: number;
            /**
             * @description Total amount
             * @example 1000
             */
            amount: number;
        };
        ReportsResponseDto: {
            /**
             * @description Date range
             * @example 2025-10-27
             */
            date: string;
            payments: components["schemas"]["MetricDto"];
            early_frauds: components["schemas"]["MetricDto"];
            disputes: components["schemas"]["MetricDto"];
            rdr: components["schemas"]["MetricDto"];
            chargebacks: components["schemas"]["MetricDto"];
        };
        TrustpilotReviewReplyToRequestDto: {
            /**
             * @description The ID of the business user who is replying
             * @example 688a9dc3b64bbca236f08910
             */
            authorBusinessUserId: string;
            /**
             * @description The reply message text
             * @example Thank you for your feedback! We appreciate your business.
             */
            message: string;
        };
        TrustpilotReviewReplyToResponseDto: {
            /**
             * @description Indicates if the reply was posted successfully
             * @example true
             */
            success: boolean;
            /**
             * @description Response message
             * @example Reply posted successfully
             */
            message: string;
            /** @description Additional data from the API */
            data?: Record<string, never>;
        };
        TrustpilotReviewReplyToBadRequestErrorDto: {
            /**
             * @description HTTP status code
             * @example 400
             */
            statusCode: number;
            /**
             * @description Validation error messages
             * @example [
             *       "authorBusinessUserId should not be empty",
             *       "authorBusinessUserId must be a string",
             *       "message should not be empty",
             *       "message must be a string"
             *     ]
             */
            message: string[];
            /**
             * @description Error type
             * @example Bad Request
             */
            error: string;
        };
        TrustpilotReviewReplyToInternalServerErrorDto: {
            /**
             * @description HTTP status code
             * @example 500
             */
            statusCode: number;
            /**
             * @description Error message describing what went wrong while posting reply
             * @example Failed to reply to review
             */
            message: string;
            /**
             * @description Error type
             * @example Internal Server Error
             */
            error: string;
        };
        CreateTrustpilotInviteDto: {
            /** @example ext-456 */
            externalId?: string | null;
            /** @example customer@example.com */
            email: string;
            /** @example John Doe */
            name?: string | null;
            /** @example 9b00016b-a006-492e-8fe8-f15c906dc538 */
            batchId?: string | null;
            /** @example 507f191e810c19729de860ea */
            templateId?: string | null;
            /** @example 2025-09-09T10:00:00.000Z */
            scheduledAt: string;
            /** @example 2025-09-09T09:00:00.000Z */
            initialScheduledAt: string;
            /**
             * @example pending
             * @enum {string}
             */
            status?: "pending" | "retry" | "sent" | "failed" | "cancelled";
        };
        UpdateTrustpilotInviteDto: {
            /** @example ext-456 */
            externalId?: string | null;
            /** @example customer@example.com */
            email?: string;
            /** @example John Doe */
            name?: string | null;
            /** @example 9b00016b-a006-492e-8fe8-f15c906dc538 */
            batchId?: string | null;
            /** @example 507f191e810c19729de860ea */
            templateId?: string | null;
            /** @example 2025-09-09T10:00:00.000Z */
            scheduledAt?: string;
            /** @example 2025-09-09T09:00:00.000Z */
            initialScheduledAt?: string;
            /**
             * @example pending
             * @enum {string}
             */
            status?: "pending" | "retry" | "sent" | "failed" | "cancelled";
        };
        MySQLConnectionStatsDto: {
            /**
             * @description Current open connections
             * @example 12
             */
            current: number;
            /**
             * @description Peak concurrent connections since server start
             * @example 95
             */
            max_used: number;
            /**
             * @description Configured maximum allowed connections
             * @example 151
             */
            max_allowed: number;
        };
        HealthCheckResultDto: {
            /**
             * @example UP
             * @enum {string}
             */
            service: "UP" | "DOWN" | "UNKNOWN";
            /**
             * @example UP
             * @enum {string}
             */
            database: "UP" | "DOWN" | "UNKNOWN";
            /**
             * @description DB ping latency in milliseconds
             * @example 7
             */
            db_latency_ms: number;
            mysql_connections?: components["schemas"]["MySQLConnectionStatsDto"];
            /**
             * Format: date-time
             * @example 2025-11-07T05:12:34.123Z
             */
            timestamp: string;
            /** @example ECONNREFUSED 127.0.0.1:3306 */
            error?: string;
        };
        HealthStatusResponseDto: {
            healthStatus: components["schemas"]["HealthCheckResultDto"];
        };
        ServiceReplyTemplateDto: {
            /**
             * @description Unique ID of the service reply template
             * @example 1
             */
            id: number;
            /**
             * @description The reply message text of the template
             * @example Thank you for contacting us. We will get back to you shortly.
             */
            reply: string;
            /**
             * @description Indicates if this template is active or inactive
             * @example true
             */
            active: boolean;
        };
        ServiceReplyTemplateListResponseDto: {
            /** @example Service reply templates retrieved successfully */
            message: string;
            /** @example 4 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 1 */
            totalPages: number;
            data: components["schemas"]["ServiceReplyTemplateDto"][];
        };
        ServiceReplyTemplateResponseDto: {
            /** @description Response message indicating the result of the operation */
            message: string;
            /** @description The service reply template object returned by the operation */
            serviceReplyTemplate: components["schemas"]["ServiceReplyTemplateDto"];
        };
        CreateServiceReplyTemplateDto: {
            /**
             * @description The text of the service reply template
             * @example Thank you for reaching out. Our support team will get back to you shortly.
             */
            reply: string;
            /**
             * @description Indicates whether the template is active
             * @default true
             * @example true
             */
            active: boolean;
        };
        UpdateServiceReplyTemplateDto: {
            /**
             * @description Updated reply text of the service reply template
             * @example We have received your message and will reply within 24 hours.
             */
            reply?: string;
            /**
             * @description Whether this reply template is active or inactive
             * @default true
             * @example false
             */
            active: boolean;
        };
        ConvertCurrencyDto: {
            /** @example EUR */
            from: string;
            /** @example USD */
            to: string;
            /** @example 100 */
            amount: number;
        };
        ConvertCurrencyResponseDto: {
            /**
             * @description Source currency
             * @example USD
             */
            from: string;
            /**
             * @description Target currency
             * @example PKR
             */
            to: string;
            /**
             * @description Original amount in source currency
             * @example 100
             */
            amount: number;
            /**
             * @description Converted amount in target currency
             * @example 28140
             */
            converted: number;
            /**
             * @description Conversion rate (target per source)
             * @example 281.4
             */
            rate: number;
            /**
             * @description Base currency used for conversion
             * @example USD
             */
            base_currency: string;
        };
        AddActionDto: {
            /**
             * @description The URL where the delayed action will be executed
             * @example https://jsonplaceholder.typicode.com/posts
             */
            url: string;
            /**
             * @description The HTTP method to use for the delayed action
             * @example POST
             * @enum {string}
             */
            method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
            /**
             * @description Optional JSON body to send with the request
             * @example {
             *       "title": "Test post",
             *       "body": "This is a test",
             *       "userId": 1
             *     }
             */
            body?: Record<string, never>;
            /**
             * @description Optional headers for the request as key-value pairs
             * @example {
             *       "Authorization": "Bearer token_here",
             *       "Content-Type": "application/json"
             *     }
             */
            headers?: Record<string, never>;
            /**
             * @description Delay time in minutes before executing the action
             * @example 5
             */
            delay: number;
        };
        SnapchatCapiCreatePixelDto: {
            /**
             * @description Title of the Facebook Pixel
             * @example My Website Pixel
             */
            title: string;
            /**
             * @description Unique Pixel ID provided by Facebook
             * @example 1234567890
             */
            pixel: string;
            /**
             * @description Access token for Facebook API
             * @example EAAGm0PX4ZCpsBAKZCZCZA...
             */
            token: string;
            /**
             * @description Project identifier this pixel belongs to
             * @example project-001
             */
            project: string;
            /**
             * @description Indicates if the pixel is active
             * @example true
             */
            active: boolean;
        };
        SnapchatCapiSinglePixelResponseDto: {
            /**
             * @description Unique identifier of the pixel record
             * @example 1
             */
            id: number;
            /**
             * @description Title of the Facebook Pixel
             * @example My Website Pixel
             */
            title: string;
            /**
             * @description Unique Pixel ID provided by Facebook
             * @example 1234567890
             */
            pixel: string;
            /**
             * @description Access token for Facebook API
             * @example EAAGm0PX4ZCpsBAKZCZCZA...
             */
            token: string;
            /**
             * @description Project identifier this pixel belongs to
             * @example project-001
             */
            project: string;
            /**
             * @description Indicates if the pixel is active
             * @example true
             */
            active: boolean;
        };
        SnapchatCapiPixelDto: {
            /**
             * @description Unique identifier of the pixel record
             * @example 1
             */
            id: number;
            /**
             * @description Display title for the pixel
             * @example My Facebook Pixel
             */
            title: string;
            /**
             * @description Facebook Pixel ID
             * @example 1234567890
             */
            pixel: string;
            /**
             * @description Access token associated with the pixel
             * @example EAABsb...token
             */
            token: string;
            /**
             * @description Project identifier this pixel belongs to
             * @example my-project
             */
            project: string;
            /**
             * @description Whether the pixel is currently active
             * @example true
             */
            active: boolean;
        };
        SnapchatCapiPixelResponseDto: {
            /** @description List of pixel records */
            data: components["schemas"]["SnapchatCapiPixelDto"][];
            /**
             * @description Total number of items available
             * @example 50
             */
            total: number;
            /**
             * @description Current page number
             * @example 1
             */
            page: number;
            /**
             * @description Number of items per page
             * @example 10
             */
            limit: number;
            /**
             * @description Total number of pages
             * @example 5
             */
            totalPages: number;
        };
        SnapchatCapiUpdatePixelDto: {
            /**
             * @description Title of the Facebook Pixel
             * @example Updated Pixel Title
             */
            title?: string;
            /**
             * @description Unique Pixel ID provided by Facebook
             * @example 0987654321
             */
            pixel?: string;
            /**
             * @description Access token for Facebook API
             * @example EAAGm0PX4ZCpsBAKZCZCZA...
             */
            token?: string;
            /**
             * @description Project identifier this pixel belongs to
             * @example project-002
             */
            project?: string;
            /**
             * @description Indicates if the pixel is active
             * @example false
             */
            active?: boolean;
        };
        Event: Record<string, never>;
        SnapchatCapiEventFullResponseDto: {
            data: components["schemas"]["Event"][];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        SnapChatClientDataDto: {
            /** @description Email */
            email: string;
            /** @description Client IP address */
            ip: string;
            /** @description Client user agent */
            user_agent: string;
            /** @description External IDs */
            external_id?: string;
        };
        SnapchatCapiDataDto: {
            /** @description Event ID */
            event_id: string;
            /** @description Event name */
            event_name: string;
            /** @description Event time (unix seconds) */
            event_time: number;
            /** @description Action source (e.g., WEB/web/website) */
            action_source: string;
            /** @description Event source URL where the event occurred */
            event_source_url: string;
            /** @description Access token */
            access_token: string;
            /** @description Pixel ID */
            pixelId: string;
        };
        SnapchatCapiPayloadDto: {
            /** @description Client data */
            clientData: components["schemas"]["SnapChatClientDataDto"];
            /** @description Event data */
            eventData: components["schemas"]["SnapChatEventDataDto"];
            /** @description General CAPI data */
            data: components["schemas"]["SnapchatCapiDataDto"];
            /** @description Optional postback URL */
            postback?: string;
            /** @description Optional test event code */
            test_event_code?: string;
        };
        SnapChatCreateEventDto: {
            /** @description Event name */
            event: string;
            /** @description Request data */
            request: components["schemas"]["SnapchatCapiPayloadDto"];
            /** @description Pixel ID */
            pixelId: number;
        };
        SnapChatEventCreateResponseDto: {
            id: number;
        };
        SnapChatUpdateEventDto: {
            /** @description Response data */
            response?: Record<string, never>;
        };
        FBCapiCreatePixelDto: {
            /**
             * @description Title of the Facebook Pixel
             * @example My Website Pixel
             */
            title: string;
            /**
             * @description Unique Pixel ID provided by Facebook
             * @example 1234567890
             */
            pixel: string;
            /**
             * @description Access token for Facebook API
             * @example EAAGm0PX4ZCpsBAKZCZCZA...
             */
            token: string;
            /**
             * @description Project identifier this pixel belongs to
             * @example project-001
             */
            project: string;
            /**
             * @description Indicates if the pixel is active
             * @example true
             */
            active: boolean;
        };
        FBCapiSinglePixelResponseDto: {
            /**
             * @description Unique identifier of the pixel record
             * @example 1
             */
            id: number;
            /**
             * @description Title of the Facebook Pixel
             * @example My Website Pixel
             */
            title: string;
            /**
             * @description Unique Pixel ID provided by Facebook
             * @example 1234567890
             */
            pixel: string;
            /**
             * @description Access token for Facebook API
             * @example EAAGm0PX4ZCpsBAKZCZCZA...
             */
            token: string;
            /**
             * @description Project identifier this pixel belongs to
             * @example project-001
             */
            project: string;
            /**
             * @description Indicates if the pixel is active
             * @example true
             */
            active: boolean;
        };
        FBCapiPixelDto: {
            /**
             * @description Unique identifier of the pixel record
             * @example 1
             */
            id: number;
            /**
             * @description Display title for the pixel
             * @example My Facebook Pixel
             */
            title: string;
            /**
             * @description Facebook Pixel ID
             * @example 1234567890
             */
            pixel: string;
            /**
             * @description Access token associated with the pixel
             * @example EAABsb...token
             */
            token: string;
            /**
             * @description Project identifier this pixel belongs to
             * @example my-project
             */
            project: string;
            /**
             * @description Whether the pixel is currently active
             * @example true
             */
            active: boolean;
        };
        FBCapiPixelResponseDto: {
            /** @description List of pixel records */
            data: components["schemas"]["FBCapiPixelDto"][];
            /**
             * @description Total number of items available
             * @example 50
             */
            total: number;
            /**
             * @description Current page number
             * @example 1
             */
            page: number;
            /**
             * @description Number of items per page
             * @example 10
             */
            limit: number;
            /**
             * @description Total number of pages
             * @example 5
             */
            totalPages: number;
        };
        FBCapiUpdatePixelDto: {
            /**
             * @description Title of the Facebook Pixel
             * @example Updated Pixel Title
             */
            title?: string;
            /**
             * @description Unique Pixel ID provided by Facebook
             * @example 0987654321
             */
            pixel?: string;
            /**
             * @description Access token for Facebook API
             * @example EAAGm0PX4ZCpsBAKZCZCZA...
             */
            token?: string;
            /**
             * @description Project identifier this pixel belongs to
             * @example project-002
             */
            project?: string;
            /**
             * @description Indicates if the pixel is active
             * @example false
             */
            active?: boolean;
        };
        FbCapiEventFullResponseDto: {
            data: components["schemas"]["Event"][];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        FacebookCapiPixelDto: {
            /** @example 1234567890123456 */
            pixelId: string;
            /** @description Facebook CAPI Access Token */
            accessToken: string;
        };
        FacebookCapiClientDataDto: {
            /**
             * @description The user's email address.
             * @example joe@example.com
             */
            email: string;
            /**
             * @description The user's IP address.
             * @example 123.123.123.123
             */
            ip: string;
            /**
             * @description The user's browser user agent string.
             * @example Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...
             */
            userAgent: string;
            /**
             * @description The Facebook click ID.
             * @example fb.1.1554763741205.AbCdEfGhIjKlMnOp
             */
            fbc: string;
            /**
             * @description The Facebook browser ID.
             * @example fb.1.1558571054389.1098115397
             */
            fbp: string;
            /**
             * @description The user country.
             * @example US
             */
            country?: string;
            /**
             * @description The user state.
             * @example DE
             */
            state?: string;
            /**
             * @description The user city.
             * @example Berlin
             */
            city?: string;
            /**
             * @description The user zip code.
             * @example 19901
             */
            zip?: string;
            /**
             * @description The user phone number.
             * @example +123123231
             */
            phone?: string;
        };
        FacebookCapiEventDataDto: {
            /** @example USD */
            currency?: string;
            /** @example 129.99 */
            total?: number;
            /** @example https://example.com/product/123 */
            sourceUrl: string;
        };
        FacebookCapiEventDto: {
            /** @example EVENT_ID_123 */
            eventId: string;
            /** @example Purchase */
            eventName: string;
            /**
             * @description Unix timestamp
             * @example 1678886400
             */
            eventTime: number;
            clientData: components["schemas"]["FacebookCapiClientDataDto"];
            eventData: components["schemas"]["FacebookCapiEventDataDto"];
            testEventCode?: string;
        };
        FbCapiPayloadDto: {
            pixel: components["schemas"]["FacebookCapiPixelDto"];
            event: components["schemas"]["FacebookCapiEventDto"];
            postback?: string;
        };
        FBCreateEventDto: {
            /** @description Event name */
            event: string;
            /** @description Request data */
            request: components["schemas"]["FbCapiPayloadDto"];
            /** @description Pixel ID */
            pixelId: number;
        };
        EventCreateResponseDto: {
            /** @description Unique Record ID */
            id: number;
        };
        FBUpdateEventDto: {
            /** @description Request data */
            response: {
                [key: string]: unknown;
            };
        };
        TiktokCapiCreatePixelDto: {
            /**
             * @description Title of the Facebook Pixel
             * @example My Website Pixel
             */
            title: string;
            /**
             * @description Unique Pixel ID provided by Facebook
             * @example 1234567890
             */
            pixel: string;
            /**
             * @description Access token for Facebook API
             * @example EAAGm0PX4ZCpsBAKZCZCZA...
             */
            token: string;
            /**
             * @description Project identifier this pixel belongs to
             * @example project-001
             */
            project: string;
            /**
             * @description Indicates if the pixel is active
             * @example true
             */
            active: boolean;
        };
        TiktokCapiSinglePixelResponseDto: {
            /**
             * @description Unique identifier of the pixel record
             * @example 1
             */
            id: number;
            /**
             * @description Title of the Facebook Pixel
             * @example My Website Pixel
             */
            title: string;
            /**
             * @description Unique Pixel ID provided by Facebook
             * @example 1234567890
             */
            pixel: string;
            /**
             * @description Access token for Facebook API
             * @example EAAGm0PX4ZCpsBAKZCZCZA...
             */
            token: string;
            /**
             * @description Project identifier this pixel belongs to
             * @example project-001
             */
            project: string;
            /**
             * @description Indicates if the pixel is active
             * @example true
             */
            active: boolean;
        };
        TiktokCapiPixelDto: {
            /**
             * @description Unique identifier of the pixel record
             * @example 1
             */
            id: number;
            /**
             * @description Display title for the pixel
             * @example My Facebook Pixel
             */
            title: string;
            /**
             * @description Facebook Pixel ID
             * @example 1234567890
             */
            pixel: string;
            /**
             * @description Access token associated with the pixel
             * @example EAABsb...token
             */
            token: string;
            /**
             * @description Project identifier this pixel belongs to
             * @example my-project
             */
            project: string;
            /**
             * @description Whether the pixel is currently active
             * @example true
             */
            active: boolean;
        };
        TiktokCapiPixelResponseDto: {
            /** @description List of pixel records */
            data: components["schemas"]["TiktokCapiPixelDto"][];
            /**
             * @description Total number of items available
             * @example 50
             */
            total: number;
            /**
             * @description Current page number
             * @example 1
             */
            page: number;
            /**
             * @description Number of items per page
             * @example 10
             */
            limit: number;
            /**
             * @description Total number of pages
             * @example 5
             */
            totalPages: number;
        };
        TiktokCapiUpdatePixelDto: {
            /**
             * @description Title of the Facebook Pixel
             * @example Updated Pixel Title
             */
            title?: string;
            /**
             * @description Unique Pixel ID provided by Facebook
             * @example 0987654321
             */
            pixel?: string;
            /**
             * @description Access token for Facebook API
             * @example EAAGm0PX4ZCpsBAKZCZCZA...
             */
            token?: string;
            /**
             * @description Project identifier this pixel belongs to
             * @example project-002
             */
            project?: string;
            /**
             * @description Indicates if the pixel is active
             * @example false
             */
            active?: boolean;
        };
        TiktokCapiEventFullResponseDto: {
            data: components["schemas"]["Event"][];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        TiktokCreateEventDto: {
            /** @description Event name */
            event: string;
            /** @description Request data */
            request: components["schemas"]["FbCapiPayloadDto"];
            /** @description Pixel ID */
            pixelId: number;
        };
        TiktokUpdateEventDto: {
            /** @description Request data */
            response: {
                [key: string]: unknown;
            };
        };
        CreateAccountDto: {
            /**
             * @description Account title
             * @example Snapchat Account Main
             */
            title: string;
            /**
             * @description External account ID from the platform
             * @example 7cb170a3-dc41-4ab3-bdcd-4434ebe664bc
             */
            external_id: string;
            /**
             * @description Target source platform
             * @example snapchat
             * @enum {string}
             */
            target_source: "snapchat" | "facebook" | "google" | "tiktok";
            /**
             * @description Snapchat OAuth Client ID
             * @example 439e231c-5720-43fe-bf1b-f66d7c7a9be4
             */
            client_id: string;
            /**
             * @description Snapchat OAuth Client Secret
             * @example ae4c72d7b5a881b10767
             */
            client_secret: string;
            /**
             * @description Snapchat Ad Account ID
             * @example 7cb170a3-dc41-4ab3-bdcd-4434ebe664bc
             */
            ad_account_id: string;
        };
        AccountDetailDto: {
            /** @example 1 */
            id: number;
            /** @example 2025-10-08T11:29:46.000Z */
            createdAt: string;
            /** @example Development Account */
            title: string;
            /** @example Internal */
            targetSource: string;
            /**
             * @description External ID for the account
             * @example ext-123
             */
            externalId: string;
            /**
             * @description Access token for the account (sensitive, optional)
             * @example abc123token
             */
            accessToken: string;
            /** @example 2025-10-08T11:29:46.000Z */
            updatedAt: string;
        };
        AccountResponseDto: {
            account: components["schemas"]["AccountDetailDto"];
        };
        AccountResponseDto_POST_Single_Account_created_successfully_Default: {
            /** @example true */
            success: Record<string, never>;
            /** @example POST */
            method: Record<string, never>;
            /** @example CREATED */
            status: Record<string, never>;
            /** @example 201 */
            statusCode: Record<string, never>;
            /** @example accounts */
            path: Record<string, never>;
            /** @example 2025-11-17T12:38:36.414Z */
            timestamp: Record<string, never>;
            /** @example Account created successfully */
            message: Record<string, never>;
            data?: components["schemas"]["AccountResponseDto"];
        };
        UpdateAccountDto: {
            /**
             * @description Account title
             * @example Updated Snapchat Account
             */
            title?: string;
            /**
             * @description External account ID from the platform
             * @example 7cb170a3-dc41-4ab3-bdcd-4434ebe664bc
             */
            external_id?: string;
            /**
             * @description Target source platform
             * @example snapchat
             * @enum {string}
             */
            target_source?: "snapchat" | "facebook" | "google" | "tiktok";
            /**
             * @description Snapchat OAuth Client ID
             * @example 439e231c-5720-43fe-bf1b-f66d7c7a9be4
             */
            client_id?: string;
            /**
             * @description Snapchat OAuth Client Secret
             * @example ae4c72d7b5a881b10767
             */
            client_secret?: string;
            /**
             * @description Snapchat Ad Account ID
             * @example 7cb170a3-dc41-4ab3-bdcd-4434ebe664bc
             */
            ad_account_id?: string;
        };
        AccountResponseDto_PATCH_Single_Account_updated_successful_Default: {
            /** @example true */
            success: Record<string, never>;
            /** @example PATCH */
            method: Record<string, never>;
            /** @example OK */
            status: Record<string, never>;
            /** @example 200 */
            statusCode: Record<string, never>;
            /** @example accounts/{id} */
            path: Record<string, never>;
            /** @example 2025-11-17T12:38:36.417Z */
            timestamp: Record<string, never>;
            /** @example Account updated successful */
            message: Record<string, never>;
            data?: components["schemas"]["AccountResponseDto"];
        };
        NoData_DELETE_Response_Account_deleted_successful_Default: {
            /** @example true */
            success: Record<string, never>;
            /** @example DELETE */
            method: Record<string, never>;
            /** @example NO_CONTENT */
            status: Record<string, never>;
            /** @example 204 */
            statusCode: Record<string, never>;
            /** @example accounts/{id} */
            path: Record<string, never>;
            /** @example 2025-11-17T12:38:36.417Z */
            timestamp: Record<string, never>;
            /** @example Account deleted successful */
            message: Record<string, never>;
        };
        AccountResponseDto_GET_Single_Account_detail_retrieved_successful_Default: {
            /** @example true */
            success: Record<string, never>;
            /** @example GET */
            method: Record<string, never>;
            /** @example OK */
            status: Record<string, never>;
            /** @example 200 */
            statusCode: Record<string, never>;
            /** @example accounts/{id} */
            path: Record<string, never>;
            /** @example 2025-11-17T12:38:36.418Z */
            timestamp: Record<string, never>;
            /** @example Account detail retrieved successful */
            message: Record<string, never>;
            data?: components["schemas"]["AccountResponseDto"];
        };
        SortByDto: {
            /** @description Whom to sort by */
            whom?: string;
            /**
             * @description Sort order
             * @enum {string}
             */
            order?: "asc" | "desc";
        };
        MetaDto: {
            /**
             * @description Total number of items
             * @example 3
             */
            total: number;
            /**
             * @description Total number of pages
             * @example 3
             */
            pages: number;
            /**
             * @description Current page number
             * @example 1
             */
            currentPage: number;
        };
        AccountListResponseDto: {
            meta: components["schemas"]["MetaDto"];
            accounts: components["schemas"]["AccountDetailDto"][];
        };
        AccountListResponseDto_GET_Array_Account_list_retrieved_successful_Default: {
            /** @example true */
            success: Record<string, never>;
            /** @example GET */
            method: Record<string, never>;
            /** @example OK */
            status: Record<string, never>;
            /** @example 200 */
            statusCode: Record<string, never>;
            /** @example accounts */
            path: Record<string, never>;
            /** @example 2025-11-17T12:38:36.419Z */
            timestamp: Record<string, never>;
            /** @example Account list retrieved successful */
            message: Record<string, never>;
            data?: components["schemas"]["AccountListResponseDto"][];
        };
        BaseAccountDto: {
            /** @example 1 */
            id: number;
            /** @example 2025-10-08T11:29:46.000Z */
            createdAt: string;
            /** @example Development Account */
            title: string;
            /** @example Internal */
            targetSource: string;
        };
        SpendListDto: {
            /** @example 17 */
            id: number;
            /** @example 2025-10-08T12:44:00.000Z */
            createdAt: string;
            /** @example 2025-10-08T14:15:01.000Z */
            updatedAt: string;
            /** @example 2025-10-07 */
            date: string;
            /** @example au */
            country: string;
            /** @example 158.93 */
            spend: string;
            /** @example 1 */
            accountId: number;
            account: components["schemas"]["BaseAccountDto"];
        };
        SpendListResponseDto: {
            meta: components["schemas"]["MetaDto"];
            spends: components["schemas"]["SpendListDto"][];
        };
        SpendListResponseDto_GET_Array_Spend_list_retrieved_successful_Default: {
            /** @example true */
            success: Record<string, never>;
            /** @example GET */
            method: Record<string, never>;
            /** @example OK */
            status: Record<string, never>;
            /** @example 200 */
            statusCode: Record<string, never>;
            /** @example spends */
            path: Record<string, never>;
            /** @example 2025-11-17T12:38:36.479Z */
            timestamp: Record<string, never>;
            /** @example Spend list retrieved successful */
            message: Record<string, never>;
            data?: components["schemas"]["SpendListResponseDto"][];
        };
        ErpDataDto: {
            /** @example 2025-10-05T18:00:00.000Z */
            date: string;
            /** @example Internal */
            source: string;
            /** @example au::en */
            countryLanguage: string;
            /** @example 51.12 */
            totalSpend: number;
        };
        ErpDataResponsedDto: {
            erpData: components["schemas"]["ErpDataDto"][];
        };
        ErpDataResponsedDto_GET_Single_ERP_data_retrieved_successful_Default: {
            /** @example true */
            success: Record<string, never>;
            /** @example GET */
            method: Record<string, never>;
            /** @example OK */
            status: Record<string, never>;
            /** @example 200 */
            statusCode: Record<string, never>;
            /** @example spends/erp-data */
            path: Record<string, never>;
            /** @example 2025-11-17T12:38:36.480Z */
            timestamp: Record<string, never>;
            /** @example ERP data retrieved successful */
            message: Record<string, never>;
            data?: components["schemas"]["ErpDataResponsedDto"];
        };
        SpendDetailDto: {
            /** @example 17 */
            id: number;
            /** @example 2025-10-08T12:44:00.000Z */
            createdAt: string;
            /** @example 2025-10-08T14:15:01.000Z */
            updatedAt: string;
            /** @example 2025-10-07 */
            date: string;
            /** @example au */
            country: string;
            /** @example 158.93 */
            spend: string;
            /** @example 1 */
            accountId: number;
            account: components["schemas"]["AccountDetailDto"];
        };
        SpendResponsedDto: {
            spend: components["schemas"]["SpendDetailDto"];
        };
        SpendResponsedDto_GET_Single_Spend_detail_retrieved_successful_Default: {
            /** @example true */
            success: Record<string, never>;
            /** @example GET */
            method: Record<string, never>;
            /** @example OK */
            status: Record<string, never>;
            /** @example 200 */
            statusCode: Record<string, never>;
            /** @example spends/{id} */
            path: Record<string, never>;
            /** @example 2025-11-17T12:38:36.481Z */
            timestamp: Record<string, never>;
            /** @example Spend detail retrieved successful */
            message: Record<string, never>;
            data?: components["schemas"]["SpendResponsedDto"];
        };
        NoData_PATCH_Response_Spend_sync_triggered_successfully_sync_by_date: {
            /** @example true */
            success: Record<string, never>;
            /** @example PATCH */
            method: Record<string, never>;
            /** @example OK */
            status: Record<string, never>;
            /** @example 200 */
            statusCode: Record<string, never>;
            /** @example spends/sync/{id} */
            path: Record<string, never>;
            /** @example 2025-11-17T12:38:36.481Z */
            timestamp: Record<string, never>;
            /** @example Spend sync triggered successfully */
            message: Record<string, never>;
        };
        NoData_PATCH_Response_Spend_sync_triggered_successfully_sync_by_date_range: {
            /** @example true */
            success: Record<string, never>;
            /** @example PATCH */
            method: Record<string, never>;
            /** @example OK */
            status: Record<string, never>;
            /** @example 200 */
            statusCode: Record<string, never>;
            /** @example spends/sync-date-range/{id} */
            path: Record<string, never>;
            /** @example 2025-11-17T12:38:36.482Z */
            timestamp: Record<string, never>;
            /** @example Spend sync triggered successfully */
            message: Record<string, never>;
        };
        AccountResponseDto_POST_Single_Accountcreatedsuccessfully: {
            /** @example true */
            success: Record<string, never>;
            /** @example POST */
            method: Record<string, never>;
            /** @example CREATED */
            status: Record<string, never>;
            /** @example 201 */
            statusCode: Record<string, never>;
            /** @example accounts */
            path: Record<string, never>;
            /** @example 2025-11-24T15:21:16.734Z */
            timestamp: Record<string, never>;
            /** @example Account created successfully */
            message: Record<string, never>;
            data?: components["schemas"]["AccountResponseDto"];
        };
        AccountResponseDto_PATCH_Single_Accountupdatedsuccessful: {
            /** @example true */
            success: Record<string, never>;
            /** @example PATCH */
            method: Record<string, never>;
            /** @example OK */
            status: Record<string, never>;
            /** @example 200 */
            statusCode: Record<string, never>;
            /** @example accounts/{id} */
            path: Record<string, never>;
            /** @example 2025-11-24T15:21:16.739Z */
            timestamp: Record<string, never>;
            /** @example Account updated successful */
            message: Record<string, never>;
            data?: components["schemas"]["AccountResponseDto"];
        };
        NoData_DELETE_Response_Accountdeletedsuccessful: {
            /** @example true */
            success: Record<string, never>;
            /** @example DELETE */
            method: Record<string, never>;
            /** @example NO_CONTENT */
            status: Record<string, never>;
            /** @example 204 */
            statusCode: Record<string, never>;
            /** @example accounts/{id} */
            path: Record<string, never>;
            /** @example 2025-11-24T15:21:16.741Z */
            timestamp: Record<string, never>;
            /** @example Account deleted successful */
            message: Record<string, never>;
        };
        AccountResponseDto_GET_Single_Accountdetailretrievedsuccessful: {
            /** @example true */
            success: Record<string, never>;
            /** @example GET */
            method: Record<string, never>;
            /** @example OK */
            status: Record<string, never>;
            /** @example 200 */
            statusCode: Record<string, never>;
            /** @example accounts/{id} */
            path: Record<string, never>;
            /** @example 2025-11-24T15:21:16.742Z */
            timestamp: Record<string, never>;
            /** @example Account detail retrieved successful */
            message: Record<string, never>;
            data?: components["schemas"]["AccountResponseDto"];
        };
        AccountListResponseDto_GET_Array_Accountlistretrievedsuccessful: {
            /** @example true */
            success: Record<string, never>;
            /** @example GET */
            method: Record<string, never>;
            /** @example OK */
            status: Record<string, never>;
            /** @example 200 */
            statusCode: Record<string, never>;
            /** @example accounts */
            path: Record<string, never>;
            /** @example 2025-11-24T15:21:16.743Z */
            timestamp: Record<string, never>;
            /** @example Account list retrieved successful */
            message: Record<string, never>;
            data?: components["schemas"]["AccountListResponseDto"][];
        };
        SpendListResponseDto_GET_Array_Spendlistretrievedsuccessful: {
            /** @example true */
            success: Record<string, never>;
            /** @example GET */
            method: Record<string, never>;
            /** @example OK */
            status: Record<string, never>;
            /** @example 200 */
            statusCode: Record<string, never>;
            /** @example spends */
            path: Record<string, never>;
            /** @example 2025-11-24T15:21:16.794Z */
            timestamp: Record<string, never>;
            /** @example Spend list retrieved successful */
            message: Record<string, never>;
            data?: components["schemas"]["SpendListResponseDto"][];
        };
        SpendResponsedDto_GET_Single_Spenddetailretrievedsuccessful: {
            /** @example true */
            success: Record<string, never>;
            /** @example GET */
            method: Record<string, never>;
            /** @example OK */
            status: Record<string, never>;
            /** @example 200 */
            statusCode: Record<string, never>;
            /** @example spends/{id} */
            path: Record<string, never>;
            /** @example 2025-11-24T15:21:16.795Z */
            timestamp: Record<string, never>;
            /** @example Spend detail retrieved successful */
            message: Record<string, never>;
            data?: components["schemas"]["SpendResponsedDto"];
        };
        JumpTaskCreateSessionRequestDto: {
            /**
             * @description Transaction ID
             * @example txn_123456789
             */
            transactionId: string;
            /**
             * @description User ID
             * @example user_123456789
             */
            userId: string;
        };
        JumpTaskSessionResponseDto: {
            /**
             * @description Session ID
             * @example 1
             */
            id: number;
            /**
             * @description Session UUID
             * @example 550e8400-e29b-41d4-a716-446655440000
             */
            uuid: string;
            /**
             * @description Transaction ID
             * @example txn_123456789
             */
            transactionId: string;
            /**
             * @description User ID
             * @example user_123456789
             */
            userId: string;
            /**
             * @description Trustpilot link
             * @example https://www.trustpilot.com/review/example.com
             */
            trustpilotLink?: string;
            /**
             * @description Postback URL
             * @example https://jumptask.go2cloud.org/aff_lsr?transaction_id=txn_123456789&adv_sub=user_123456789
             */
            postbackUrl?: string;
            /**
             * @description Session status
             * @example created
             */
            status: string;
            /**
             * Format: date-time
             * @description Creation date
             * @example 2024-01-01T00:00:00.000Z
             */
            createdAt: string;
            /**
             * Format: date-time
             * @description Last update date
             * @example 2024-01-01T00:00:00.000Z
             */
            updatedAt: string;
        };
        JumpTaskSessionDataResponseDto: {
            /** @description Session data */
            data: components["schemas"]["JumpTaskSessionResponseDto"];
        };
        SessionBadRequestErrorDto: {
            /** @example 400 */
            statusCode: number;
            /**
             * @description Array of validation error messages for session operations
             * @example [
             *       "Transaction ID is required",
             *       "User ID is required",
             *       "Invalid status value",
             *       "Trustpilot link must be a valid URL"
             *     ]
             */
            message: string[];
            /** @example Bad Request */
            error: string;
        };
        SessionInternalServerErrorDto: {
            /** @example 500 */
            statusCode: number;
            /**
             * @description An unexpected error occurred during session processing.
             * @example Error processing session data.
             */
            message: string;
            /** @example Internal Server Error */
            error: string;
        };
        JumpTaskPatchSessionRequestDto: {
            /**
             * @description Trustpilot link
             * @example https://www.trustpilot.com/review/example.com
             */
            trustpilotLink?: string;
            /**
             * @description Session status
             * @example completed
             * @enum {string}
             */
            status?: "created" | "completed";
        };
        SessionNotFoundErrorDto: {
            /** @example 404 */
            statusCode: number;
            /**
             * @description Session with the specified criteria was not found
             * @example Session not found
             */
            message: string;
            /** @example Not Found */
            error: string;
        };
        DataListResponseDto: {
            /** @description Array of sessions */
            data: {
                /** @example 1 */
                id?: number;
                /** @example 550e8400-e29b-41d4-a716-446655440000 */
                uuid?: string;
                /** @example txn_123456789 */
                transactionId?: string;
                /** @example user_123456789 */
                userId?: string;
                /** @example https://www.trustpilot.com/review/example.com */
                trustpilotLink?: string;
                /** @example https://jumptask.go2cloud.org/aff_lsr?transaction_id=txn_123456789&adv_sub=user_123456789 */
                postbackUrl?: string;
                /** @example created */
                status?: string;
                /** @example 2024-01-01T00:00:00.000Z */
                createdAt?: string;
                /** @example 2024-01-01T00:00:00.000Z */
                updatedAt?: string;
            }[];
            /**
             * @description Total count
             * @example 100
             */
            total: number;
            /**
             * @description Current page
             * @example 1
             */
            page: number;
            /**
             * @description Items per page
             * @example 10
             */
            limit: number;
        };
        InternalServerErrorDto: {
            /** @example 500 */
            statusCode: number;
            message: string[];
            error: string;
        };
        HealthResponseDto: {
            /**
             * @description Health check message
             * @example Klaviyo Backend API is running!
             */
            message: string;
            /**
             * @description Current server timestamp
             * @example 2024-01-01T00:00:00.000Z
             */
            timestamp: string;
            /**
             * @description API version
             * @example 1.0.0
             */
            version: string;
            /**
             * @description Database connection status
             * @example true
             */
            database: Record<string, never>;
        };
        CreateEventDto: {
            /** @example Viewed Product */
            eventName: string;
            /**
             * @example {
             *       "email": "sarah@example.com",
             *       "first_name": "Sarah",
             *       "last_name": "Connor"
             *     }
             */
            profileAttributes: {
                [key: string]: unknown;
            };
            /**
             * @example {
             *       "Brand": "Kids Book",
             *       "ProductID": 1111,
             *       "ProductName": "Winnie the Pooh"
             *     }
             */
            eventAttributes: {
                [key: string]: unknown;
            };
            /** @example 2022-11-08T00:00:00+00:00 */
            timestamp?: string;
            /** @example 9.99 */
            value?: number;
            /** @example USD */
            value_currency?: string;
            /** @example unique-event-id */
            uniqueId?: string;
        };
        CreateBulkEventDto: {
            events: components["schemas"]["CreateEventDto"][];
        };
        KlaviyoProfileMergeByEmailRequestDto: {
            /**
             * @description Source email - profile to be merged into target
             * @example source@example.com
             */
            sourceEmail: string;
            /**
             * @description Target email - destination profile (will be created if does not exist)
             * @example target@example.com
             */
            targetEmail: string;
        };
        CreateFunnelDto: {
            /** @example Conversion Funnel */
            funnel: string;
            /**
             * @description Attribute IDs
             * @example [
             *       1,
             *       2
             *     ]
             */
            attributeIds: string[];
        };
        DeleteResponseDto: {
            /**
             * @description Raw response from the delete operation
             * @example []
             */
            raw: Record<string, never>[];
            /**
             * @description Number of affected rows by the delete operation
             * @example 1
             */
            affected: number;
        };
        ErrorResponseDto: {
            /**
             * @description Request success status
             * @example false
             */
            success: boolean;
            /**
             * @description Error message
             * @example Validation failed
             */
            message: string;
        };
        ChangeLogDto: {
            /**
             * @description Unique ID of the changelog record
             * @example 1
             */
            id: number;
            /**
             * @description Action performed on the entity
             * @example CREATE
             */
            action: string;
            /**
             * @description Type of entity affected
             * @example funnel
             */
            entityType: string;
            /**
             * @description ID of the affected entity
             * @example 101
             */
            entityId: number;
            /**
             * @description Description of the change
             * @example Created a new funnel for the marketing campaign
             */
            description: string | null;
            /**
             * @description Fields that were changed
             * @example {
             *       "oldData": {},
             *       "updatedData": {
             *         "name": "Funnel 1",
             *         "status": "active"
             *       }
             *     }
             */
            changes: Record<string, never> | null;
            /**
             * @description ID of the user who performed the action
             * @example 10
             */
            userId: number | null;
            /**
             * Format: date-time
             * @description Timestamp when the change was recorded
             * @example 2025-11-18T10:15:30.000Z
             */
            createdAt: string;
        };
        ChangeLogListResponseDto: {
            /** @example 4 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 1 */
            limit: number;
            /** @example 1 */
            totalPages: number;
            changeLogs: components["schemas"]["ChangeLogDto"][];
        };
        HelloResponseDto: {
            /**
             * @description Greeting message
             * @example Hello World!
             */
            message: string;
        };
        ReportItemDto: {
            /**
             * @description Unique ID of the report item
             * @example 1
             */
            id: number;
            /**
             * @description Order ID
             * @example ORD-123456
             */
            orderId: string;
            /**
             * @description Country code
             * @example US
             */
            country: string;
            /**
             * @description Origin of the order
             * @example web
             */
            origin: string;
            /**
             * @description Gender of the customer
             * @example male
             */
            gender: string;
            /**
             * @description Language code
             * @example en
             */
            language: string;
            /**
             * @description Slug associated with the report item
             * @example sample-slug-1
             */
            slug: string;
            /**
             * @description Customer email
             * @example customer1@example.com
             */
            email: string;
        };
        NotFoundErrorDto: {
            /** @example 404 */
            statusCode: number;
            /** @example Account with ID 123 not found */
            message: string;
            /** @example Not Found */
            error: string;
        };
        ReportItemChangeLogDto: {
            /** @example 1 */
            id: number;
            /** @example 101 */
            reportItemId: number;
            /**
             * @description Changed field name or scope
             * @example customerEmail
             */
            field: string;
            /**
             * @description Old value(s) as JSON
             * @example {
             *       "customerEmail": "old@example.com"
             *     }
             */
            oldValue: {
                [key: string]: unknown;
            } | null;
            /**
             * @description New value(s) as JSON
             * @example {
             *       "customerEmail": "new@example.com"
             *     }
             */
            newValue: {
                [key: string]: unknown;
            } | null;
            /** @example admin@company.com */
            changedBy: Record<string, never> | null;
            /** @example Customer support correction */
            reason: Record<string, never> | null;
            /**
             * @description Optional metadata (IP, user agent, etc.)
             * @example {
             *       "ip": "203.0.113.10",
             *       "source": "bridge-crm"
             *     }
             */
            meta: {
                [key: string]: unknown;
            } | null;
            /** @example 2025-11-11T12:35:11.000Z */
            createdAt: string;
        };
        ReportItemChangeLogListResponseDto: {
            /** @example 4 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 1 */
            limit: number;
            /** @example 1 */
            totalPages: number;
            data: components["schemas"]["ReportItemChangeLogDto"][];
        };
        ReportItemAdSourceResponseDto: {
            /**
             * @description Ad source ID
             * @example 1
             */
            id: number;
            /**
             * @description Report item ID
             * @example 1
             */
            reportItemId: Record<string, never> | null;
            /**
             * @description Ad source level 1
             * @example Facebook-aq
             */
            adSourceLevel1: string;
            /**
             * @description Ad source level 2
             * @example Newsletter
             */
            adSourceLevel2: string;
            /**
             * @description Ad source level 1 adopted
             * @example
             */
            adSourceLevel1Adopted: string;
            /**
             * @description First UTM source
             * @example Facebook-AQ
             */
            utmFirstSource: string;
            /**
             * @description First UTM medium
             * @example RW-Quiz-28DNYC
             */
            utmFirstMedium: string;
            /**
             * @description First UTM campaign
             * @example AdQ_PLE_NB_WW_web_Alldev_Purchase_7d_LC_BAU_No-Yelling_en_0808
             */
            utmFirstCampaign: string;
            /**
             * @description First UTM content
             * @example PLE-379_1-1080x1920-EN
             */
            utmFirstContent: string;
            /**
             * @description Last UTM source
             * @example newsletter
             */
            utmLastSource: string;
            /**
             * @description Last UTM medium
             * @example flow
             */
            utmLastMedium: string;
            /**
             * @description Last UTM campaign
             * @example abandoned
             */
            utmLastCampaign: string;
            /**
             * @description Last UTM content
             * @example 120232378248780099
             */
            utmLastContent: string;
            /**
             * @description Last paid UTM source
             * @example Facebook-AQ
             */
            utmLastPaidSource: string;
            /**
             * @description Last paid UTM medium
             * @example RW-Quiz-28DNYC
             */
            utmLastPaidMedium: string;
            /**
             * @description Last paid UTM campaign
             * @example AdQ_PLE_NB_WW_web_Alldev_Purchase_7d_LC_BAU_No-Yelling_en_0808
             */
            utmLastPaidCampaign: string;
            /**
             * @description Last paid UTM content
             * @example PLE-379_1-1080x1920-EN
             */
            utmLastPaidContent: string;
            /**
             * @description Full UTM data JSON
             * @example {
             *       "first": {
             *         "source": "Facebook-AQ",
             *         "medium": "RW-Quiz-28DNYC",
             *         "campaign": "...",
             *         "content": "..."
             *       },
             *       "last": {
             *         "source": "newsletter",
             *         "medium": "flow",
             *         "campaign": "abandoned",
             *         "content": "..."
             *       },
             *       "lastPaid": {
             *         "source": "Facebook-AQ",
             *         "medium": "RW-Quiz-28DNYC",
             *         "campaign": "...",
             *         "content": "..."
             *       }
             *     }
             */
            utmData: Record<string, never>;
        };
        ReportItemPaymentDto: {
            /** @example 501 */
            id: number;
            /** @example 120.5 */
            grossTotal: number;
            /** @example 98.3 */
            netTotal: number;
            /** @example 80 */
            grossInitialSubTotal: number;
            /** @example 65 */
            netInitialSubTotal: number;
            /** @example 20 */
            grossUpsellTotal: number;
            /** @example 15 */
            netUpsellTotal: number;
            /** @example 30 */
            grossRecurringTotal: number;
            /** @example 20 */
            netRecurringTotal: number;
            /**
             * Format: date-time
             * @example 2024-05-15T10:23:00Z
             */
            firstPaymentDate: string;
            /**
             * Format: date-time
             * @example 2024-06-01T15:40:00Z
             */
            lastPaymentDate: string;
            /** @example 5 */
            paymentsCount: number;
            /** @example 4 */
            paymentsInCount: number;
            /** @example 1 */
            paymentsOutCount: number;
            /** @example ORD-987654 */
            orderId: string;
            /** @example 200 */
            grossInitialLifetimeTotal: number;
            /** @example 180 */
            netInitialLifetimeTotal: number;
            /** @example 120 */
            grossInitialTotal: number;
            /** @example 110 */
            netInitialTotal: number;
        };
        ReportItemPaymentInfoDto: {
            /** @example 301 */
            id: number;
            /** @example credit_card */
            cardType: string;
            /** @example visa */
            cardBrand: string;
            /** @example stripe */
            orchestratorName: string;
            /** @example stripe */
            pspName: string;
            /** @example USD */
            currency: string;
            /** @example 1 */
            currencyRate: number;
        };
        ReportItemResponseDto: {
            /**
             * @description Unique report item ID
             * @example 1
             */
            id: number;
            /**
             * @description Timezone start date
             * @example 2025-10-29T10:00:00Z
             */
            timezoneDate: Record<string, never> | null;
            /**
             * @description Timezone finish date
             * @example 2025-10-29T15:00:00Z
             */
            timezoneFinishDate: Record<string, never> | null;
            /**
             * @description Order identifier
             * @example ORD-12345
             */
            orderId: string;
            /**
             * @description Period of the report item
             * @example Monthly
             */
            period: string;
            /**
             * @description Country of the customer
             * @example USA
             */
            country: string;
            /**
             * @description Gender of the customer
             * @example male
             */
            gender: string;
            /**
             * @description Customer language
             * @example en
             */
            language: string;
            /**
             * @description Is lifetime customer
             * @example true
             */
            lifetime: boolean;
            /**
             * @description Product slug
             * @example product-slug
             */
            slug: string;
            /**
             * @description Has cancelations
             * @example false
             */
            hasCancelations: boolean;
            /**
             * @description Has refund requests
             * @example true
             */
            hasRefundRequests: boolean;
            /**
             * @description Is a test user
             * @example false
             */
            testUser: boolean;
            /**
             * @description Cancelation reason
             * @example Customer requested cancellation
             */
            cancelationReason: string;
            /**
             * @description Stop reason
             * @example Stopped due to non-payment
             */
            stopReason: string;
            /**
             * @description Timezone stop date
             * @example 2025-10-29T14:00:00Z
             */
            timezoneStopDate: Record<string, never> | null;
            /**
             * @description Primary customer email
             * @example customer@example.com
             */
            customerEmail: string;
            /**
             * @description Origin of the report item
             * @example website
             */
            origin: string;
            /**
             * @description Alternate customer email
             * @example alternate@example.com
             */
            customerEmailAlternate: string;
            /**
             * @description Attributes as JSON object
             * @example {
             *       "plan": "premium",
             *       "source": "ads"
             *     }
             */
            attributes: Record<string, never>;
            /**
             * @description State of the report item
             * @example active
             */
            state: string;
            /**
             * @description Last updated timestamp
             * @example 2025-10-29T16:00:00Z
             */
            updatedAt: Record<string, never> | null;
            adSource?: components["schemas"]["ReportItemAdSourceResponseDto"];
            payments?: components["schemas"]["ReportItemPaymentDto"][];
            paymentInfos?: components["schemas"]["ReportItemPaymentInfoDto"][];
        };
        ReportItemListResponseDto: {
            /** @description List of report items for the current page */
            reportItems: components["schemas"]["ReportItemResponseDto"][];
            /** @description Pagination metadata */
            meta: components["schemas"]["MetaDto"];
        };
        TransactionAggregationResponseDto: {
            /**
             * @description Total number of transactions
             * @example 120
             */
            transactionCount: number;
            /**
             * @description Total revenue from emails
             * @example 4500.75
             */
            emailRevenue: number;
            /**
             * @description Average share percentage (net/gross)
             * @example 0.85
             */
            avgSharePercentage: number;
            /**
             * @description Customer email with highest revenue
             * @example topuser@example.com
             */
            topPerformer: string;
        };
        WeeklyMediumFunnelDto: {
            /**
             * @description Funnel name (slug)
             * @example test-funnel
             */
            name: string;
        };
        WeeklyMediumTransactionsResponseDto: {
            /**
             * @description ISO week number
             * @example 45
             */
            week: number;
            /**
             * @description List of funnels with transaction counts per medium
             * @example [
             *       {
             *         "name": "test-funnel",
             *         "email": 2,
             *         "social": 0,
             *         "organic": 3,
             *         "paid": 1
             *       },
             *       {
             *         "name": "test-funnel-2",
             *         "email": 1,
             *         "social": 2,
             *         "organic": 1,
             *         "paid": 0
             *       }
             *     ]
             */
            funnels: components["schemas"]["WeeklyMediumFunnelDto"][];
        };
        FunnelMetricsResponseDto: {
            /** @example Signup Funnel */
            funnel: string;
            /** @example 1245 */
            totalTxn: number;
            /** @example 892 */
            emailTotal: number;
            /** @example 234 */
            newsletterUtm: number;
            /** @example 156 */
            abandonedUtm: number;
            /** @example 89 */
            promo: number;
            /** @example 1371 */
            total: number;
            /** @example 65 */
            mailPercent: number;
        };
        FunnelMediumPerformanceResponseDto: {
            /**
             * @description Campaign / Funnel name
             * @example Newsletter Campaign
             */
            campaignName: string;
            /**
             * @description Email transactions count
             * @example 10
             */
            email: number;
            /**
             * @description Social transactions count
             * @example 60
             */
            social: number;
            /**
             * @description Organic transactions count
             * @example 40
             */
            organic: number;
            /**
             * @description Paid transactions count
             * @example 40
             */
            paid: number;
            /**
             * @description Total transactions for the campaign
             * @example 150
             */
            total: number;
        };
        UtmParamsDto: {
            /**
             * @description UTM source parameter
             * @example Facebook-AQ
             */
            source: string;
            /**
             * @description UTM medium parameter
             * @example RW-Quiz-28DNYC
             */
            medium: string;
            /**
             * @description UTM campaign parameter
             * @example AdQ_PLE_NB_WW_web_Alldev_Purchase_7d_LC_BAU_No-Yelling_en_0808
             */
            campaign: string;
            /**
             * @description UTM content parameter
             * @example PLE-379_1-1080x1920-EN
             */
            content: string;
        };
        AdSourceDto: {
            /** @description First UTM parameters */
            first: components["schemas"]["UtmParamsDto"];
            /** @description Last UTM parameters */
            last: components["schemas"]["UtmParamsDto"];
            /** @description Last paid UTM parameters */
            lastPaid: components["schemas"]["UtmParamsDto"];
        };
        UpdateCustomerEmailDto: {
            /**
             * @description New primary customer email to set
             * @example new.customer@example.com
             */
            customerEmail: string;
        };
        ReportItemEmailUpdateResponseDto: {
            /**
             * @description Whether the update request was successful
             * @example true
             */
            success: boolean;
            /**
             * @description Updated report item payload
             * @example {
             *       "id": 1,
             *       "orderId": "ORD-123456",
             *       "country": "US",
             *       "origin": "web",
             *       "gender": "male",
             *       "language": "en",
             *       "slug": "sample-slug-1",
             *       "email": "new.email@example.com"
             *     }
             */
            data: components["schemas"]["ReportItemDto"];
        };
        CreateOrderItemDto: {
            /** @example REF-98765 */
            referenceId: string;
            /** @example Monthly Subscription */
            title: string;
            /** @example SKU-001 */
            sku: string;
            /** @example 49.99 */
            price: number;
            /** @example 1 */
            quantity: number;
            /** @example 7 days trial */
            subTrial: string;
            /** @example Monthly */
            subBilling: string;
            /** @example subscription */
            type: string;
            /** @example CANCEL_EVENT_XYZ */
            customCancelEvent: string;
            /** @example https://webhook.site/123 */
            webhook: string;
        };
        OrderItemResponseDto: {
            /**
             * @description The unique identifier for the order item
             * @example 1
             */
            id: number;
            /**
             * @description The reference ID of the order item
             * @example REF-98765
             */
            referenceId: string;
            /**
             * @description The title of the order item
             * @example Monthly Subscription
             */
            title: string;
            /**
             * @description The SKU of the order item
             * @example SKU-001
             */
            sku: string;
            /**
             * @description The price of the order item
             * @example 49.99
             */
            price: number;
            /**
             * @description The quantity of the order item
             * @example 1
             */
            quantity: number;
            /**
             * @description The subscription trial information, if applicable
             * @example 7 days trial
             */
            subTrial?: string;
            /**
             * @description The subscription billing information, if applicable
             * @example Monthly
             */
            subBilling?: string;
            /**
             * @description The type of order item (e.g., subscription, product)
             * @example subscription
             */
            type: string;
            /**
             * @description Custom cancel event associated with the order item
             * @example CANCEL_EVENT_XYZ
             */
            customCancelEvent?: string;
            /**
             * @description Webhook URL for order item notifications
             * @example https://webhook.site/123
             */
            webhook?: string;
        };
        OrderItemResponseWrapperDto: {
            /**
             * @description Indicates whether the request was successful
             * @example true
             */
            success: boolean;
            /**
             * @description Response message
             * @example Order item created successfully
             */
            message: string;
            /** @description The created order item */
            data: components["schemas"]["OrderItemResponseDto"];
        };
        PaginatedOrderItemResponseDto: {
            /** @description The list of order items */
            data: components["schemas"]["OrderItemResponseDto"][];
            /**
             * @description The total number of order items
             * @example 25
             */
            total: number;
            /**
             * @description The current page number
             * @example 1
             */
            page: number;
            /**
             * @description The number of order items per page
             * @example 10
             */
            limit: number;
            /**
             * @description The total number of pages available
             * @example 3
             */
            totalPages: number;
        };
        DeleteOrderItemResponseDto: {
            /**
             * @description Indicates whether the request was successful
             * @example true
             */
            success: boolean;
            /**
             * @description Response message
             * @example Order item deleted successfully
             */
            message: string;
        };
        OrderItemArrayResponseWrapperDto: {
            /**
             * @description Indicates whether the request was successful
             * @example true
             */
            success: boolean;
            /**
             * @description Response message
             * @example Order items fetched successfully
             */
            message: string;
            /** @description The list of order items */
            data: components["schemas"]["OrderItemResponseDto"][];
        };
        MySQLConnectionsDto: {
            /**
             * @description Current active connections
             * @example 5
             */
            current: number;
            /**
             * @description Maximum connections used
             * @example 10
             */
            max_used: number;
            /**
             * @description Maximum allowed connections
             * @example 151
             */
            max_allowed: number;
        };
        WebhookPaginatedResponseDto: {
            data: components["schemas"]["WebhookResponseDto"][];
            /** @example 100 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 10 */
            totalPages: number;
        };
        Webhook: {
            /** @description The unique identifier of the webhook */
            id: number;
            /** @description The title of the webhook */
            title?: string;
            /** @description The events that trigger the webhook */
            events: string[];
            /** @description The URL endpoint to send the webhook to */
            endpoint: string;
            /**
             * @description The HTTP method to use when sending the webhook
             * @default GET
             */
            method: string;
            /** @description The authorization header to use when sending the webhook */
            authorization?: string;
            /** @description The project associated with the webhook */
            project?: string;
        };
        JobResponseDto: {
            /** @description The unique identifier of the job */
            id: number;
            /** @description The action to be performed by the job */
            action: string;
            /** @description The data associated with the job */
            data?: Record<string, never>;
            /**
             * Format: date-time
             * @description The date and time when the job was created
             */
            created_at: string;
            /** @description The current status of the job */
            status: string;
            /** @description The date and time when the job was executed */
            executed_at?: Record<string, never>;
            /** @description The ID of the associated webhook */
            webhook_id?: number;
        };
        JobPaginatedResponseDto: {
            data: components["schemas"]["JobResponseDto"][];
            /** @example 100 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 10 */
            totalPages: number;
        };
        AddJobDto: {
            /**
             * @description The data to be processed by the job
             * @example {
             *       "key": "value"
             *     }
             */
            data: Record<string, never>;
            /**
             * @description The event type for the job
             * @example webhook.created
             */
            event: string;
        };
        Job: {
            /** @description The unique identifier of the job */
            id: number;
            /** @description The action to be performed by the job */
            action: string;
            /** @description The data associated with the job */
            data: Record<string, never>;
            /**
             * Format: date-time
             * @description The date and time when the job was created
             */
            created_at: string;
            /** @description The current status of the job */
            status: string;
            /**
             * Format: date-time
             * @description The date and time when the job was executed
             */
            executed_at?: string;
            /** @description The ID of the associated webhook */
            webhook_id?: number;
            /** @description The associated webhook */
            webhook: components["schemas"]["Webhook"];
        };
        WebhookDto: Record<string, never>;
        CreateSessionDto: {
            extraData?: {
                [key: string]: unknown;
            };
            quiz?: {
                [key: string]: unknown;
            };
            ip: string;
            cookies: string;
            uuid?: string;
            analyticsId?: string;
            analyticsIdv3?: string;
            origin?: string;
            project: string;
            query: {
                [key: string]: unknown;
            };
            referer?: string;
            slug: string;
            "user-agent": string;
        };
        SessionDevice: Record<string, never>;
        SessionDataResponseDto: {
            /**
             * @description Session ID
             * @example 1
             */
            id: number;
            /**
             * @description Project name
             * @example netzet
             */
            project: string;
            /**
             * @description Session slug
             * @example some-slug
             */
            slug: string;
            /**
             * @description IP address
             * @example 127.0.0.1
             */
            ip: string;
            /**
             * @description Country
             * @example Lithuania
             */
            country: string;
            /**
             * @description Is EU country
             * @example true
             */
            isEu: boolean;
            /**
             * @description Referer URL
             * @example https://www.google.com
             */
            referer: string;
            /**
             * @description User agent
             * @example Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36
             */
            useragent: string;
            /**
             * @description Origin URL
             * @example https://netzet.com
             */
            origin: string;
            /**
             * @description Cookies
             * @example {
             *       "key": "value"
             *     }
             */
            cookies: Record<string, never>;
            /**
             * @description Query parameters
             * @example {
             *       "param": "value"
             *     }
             */
            query: Record<string, never>;
            /**
             * Format: date-time
             * @description Creation timestamp
             */
            createdAt?: string;
            /**
             * Format: date-time
             * @description Update timestamp
             */
            updatedAt?: string;
            /**
             * @description Session UUID
             * @example a1b2c3d4-e5f6-7890-1234-567890abcdef
             */
            uuid: string;
            /**
             * @description Extra data
             * @example {
             *       "custom": "data"
             *     }
             */
            extraData: Record<string, never>;
            /**
             * @description Email address
             * @example user@example.com
             */
            email: string;
            /**
             * @description Analytics ID
             * @example ga-12345
             */
            analyticsId: string;
            state: string;
            /**
             * @description Is purchased
             * @example false
             */
            isPurchased: boolean;
            device?: components["schemas"]["SessionDevice"];
        };
        PublicPaymentResponseDto: {
            /** @description Source */
            source: string;
            /** @description Charge ID */
            chargeId: string;
            /** @description Total amount */
            total: number;
            /** @description Currency */
            currency: string;
            /** @description Date */
            date: string;
            /** @description Type */
            type: string;
        };
        PaymentFilterDto: {
            /**
             * @description Payment source (e.g., AppStore, Stripe, PayPal)
             * @example AppStore
             */
            source?: string;
            /**
             * @description Unique source identifier
             * @example SRC12345
             */
            sourceId?: string;
            /**
             * @description Filter payments between two timezone dates (start)
             * @example 2025-10-01
             */
            timezoneDateFrom?: string;
            /**
             * @description Filter payments between two timezone dates (end)
             * @example 2025-10-31
             */
            timezoneDateTo?: string;
            /**
             * @description Payment type (e.g., payment_success, payment_refunded)
             * @example payment_success
             */
            type?: string;
            /**
             * @description Unique order identifier
             * @example ORD-56789
             */
            orderId?: string;
            /**
             * @description Single main order ID (used when filtering by one order)
             * @example MAIN-999
             */
            mainOrderId?: string;
            /**
             * @description Multiple main order IDs (used when filtering by many orders)
             * @example [
             *       "MAIN-999",
             *       "MAIN-888",
             *       "MAIN-777"
             *     ]
             */
            mainOrderIds?: string[];
            /**
             * @description Sort by field
             * @example date
             */
            sortBy?: string;
            /**
             * @description Sort order
             * @example DESC
             */
            sortOrder?: string;
            /**
             * @description Page number
             * @example 1
             */
            page?: number;
            /**
             * @description Items per page
             * @example 10
             */
            limit?: number;
        };
        PaymentDto: {
            /**
             * @description Payment ID
             * @example 1
             */
            id: number;
            /**
             * @description Payment source
             * @example AppStore
             */
            source: string;
            /**
             * @description Unique source identifier
             * @example SRC12345
             */
            sourceId: string;
            /**
             * @description Source type
             * @example Subscription
             */
            sourceType: string;
            /**
             * @description Original date of payment
             * @example 2025-10-29T14:30:00.000Z
             */
            date: Record<string, never>;
            /**
             * @description Timezone date of payment
             * @example 2025-10-29T20:30:00.000Z
             */
            timezoneDate: Record<string, never>;
            /**
             * @description Total payment amount
             * @example 49.99
             */
            total: number;
            /**
             * @description Payment type
             * @example payment_success
             */
            type: string;
            /**
             * @description Timezone report date
             * @example 2025-10-29T21:00:00.000Z
             */
            timezoneReportDate: Record<string, never>;
            /**
             * @description Order ID
             * @example ORD-56789
             */
            orderId: string;
            /**
             * @description Processor ID
             * @example PROC-123
             */
            processorId: string;
            /**
             * @description Main Order ID
             * @example MAIN-999
             */
            mainOrderId: string;
            /**
             * @description Currency
             * @example USD
             */
            currency: string;
            /**
             * @description Original total amount
             * @example 49.99
             */
            orgTotal: number;
            /**
             * @description Currency conversion rate
             * @example 1
             */
            currencyRate: number;
        };
        PaymentMetaDto: {
            /**
             * @description Total number of items
             * @example 100
             */
            total: number;
            /**
             * @description Current page number
             * @example 1
             */
            currentPage: number;
            /**
             * @description Total number of pages
             * @example 10
             */
            pages: number;
        };
        PaymentListResponseDto: {
            /** @description List of payments */
            payments: components["schemas"]["PaymentDto"][];
            /** @description Pagination metadata */
            meta: components["schemas"]["PaymentMetaDto"];
        };
        HealthStatusDto: {
            /**
             * @description Service status
             * @example UP
             */
            service: string;
            /**
             * @description Database status
             * @example UP
             */
            database: string;
            /**
             * @description Database latency in milliseconds
             * @example 2
             */
            db_latency_ms: number;
            /** @description MySQL connection statistics */
            mysql_connections?: components["schemas"]["MySQLConnectionsDto"];
            /**
             * Format: date-time
             * @description Timestamp of health check
             * @example 2025-11-07T09:49:01.235Z
             */
            timestamp: string;
            /**
             * @description Error message if health check fails
             * @example Connection failed
             */
            error?: string;
        };
        QueueStatsResponseDto: {
            /**
             * @description Queue name
             * @example applovin_sync_queue
             */
            queue: string;
            /**
             * @description Total messages in the queue
             * @example 0
             */
            messages: number;
            /**
             * @description Messages ready for consumers
             * @example 0
             */
            ready: number;
            /**
             * @description Messages not acknowledged yet
             * @example 0
             */
            unacked: number;
            /**
             * @description Number of consumers for this queue
             * @example 0
             */
            consumers: number;
        };
        QueuesResponseDto: {
            /**
             * @description Queue name
             * @example payment_management_queue
             */
            name: string;
            /**
             * @description Total messages in the queue
             * @example 0
             */
            messages: number;
            /**
             * @description Messages ready for consumers
             * @example 0
             */
            ready: number;
            /**
             * @description Messages not acknowledged yet
             * @example 0
             */
            unacked: number;
            /**
             * @description Number of consumers for this queue
             * @example 1
             */
            consumers: number;
        };
        SubscriptionDto: {
            /**
             * @description The ID of the subscription
             * @example 1
             */
            id: number;
            /**
             * @description The start date of the subscription
             * @example 2025-01-01T00:00:00.000Z
             */
            startDate: Record<string, never> | null;
            /**
             * @description The finish date of the subscription
             * @example 2026-01-01T00:00:00.000Z
             */
            finishDate: Record<string, never> | null;
            /**
             * @description The source ID of the subscription
             * @example SOURCE001
             */
            sourceId: string;
            /**
             * @description The period of the subscription (e.g., "1m", "12m", "2y")
             * @example 1m
             */
            period: string;
            /**
             * @description Whether the subscription is active (1 for active, 0 for inactive)
             * @example 1
             */
            active: boolean;
            /**
             * @description The total price of the subscription
             * @example 49.99
             */
            total: number;
            /**
             * @description The order ID associated with the subscription
             * @example ORD12345
             */
            orderId: string;
            /**
             * @description The prefix for the subscription
             * @example PREX
             */
            prefix: string;
            /**
             * @description Whether the subscription is a lifetime subscription (1 for lifetime, 0 for non-lifetime)
             * @example 0
             */
            lifetime: boolean;
        };
        SubscriptionListResponseDto: {
            /** @example 4 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 1 */
            limit: number;
            /** @example 1 */
            totalPages: number;
            subscriptions: components["schemas"]["SubscriptionDto"][];
        };
        CreateSubscriptionDto: {
            /**
             * Format: date-time
             * @example 2025-11-10T03:43:41.188Z
             */
            startDate?: string;
            /**
             * Format: date-time
             * @example 2026-11-10T03:43:41.188Z
             */
            finishDate?: string;
            /** @example source_12345 */
            sourceId: string;
            /**
             * @description Period: Xd / Xm / Xy
             * @example 1m
             */
            period: string;
            /** @example true */
            active: boolean;
            /** @example 29.99 */
            total: number;
            /** @example order_90876 */
            orderId: string;
            /** @example SUB */
            prefix: string;
            /** @example false */
            lifetime: boolean;
        };
        SubscriptionResponseDto: {
            /**
             * @description Subscription ID
             * @example 1
             */
            id: number;
            /**
             * Format: date-time
             * @description Subscription start date
             * @example 2025-08-13T10:26:06.407Z
             */
            startDate: string | null;
            /**
             * Format: date-time
             * @description Subscription finish date
             * @example 2025-08-13T10:26:06.407Z
             */
            finishDate: string | null;
            /**
             * @description External source identifier
             * @example abc-11
             */
            sourceId: string;
            /**
             * @description Subscription period (e.g., "28d", "1m", "3m", "2y")
             * @example 1m
             */
            period: string;
            /**
             * @description Whether subscription is active
             * @example true
             */
            active: boolean;
            /**
             * @description Total subscription price
             * @example 29.99
             */
            total: number;
            /**
             * @description Order ID
             * @example Ord-12342
             */
            orderId: string;
            /**
             * @description Subscription prefix
             * @example WE
             */
            prefix: string;
            /**
             * @description Whether subscription is lifetime
             * @example false
             */
            lifetime: boolean;
        };
        NextPaymentDto: {
            /**
             * @description Payment due date
             * @example 2025-09-02
             */
            date: string;
            /**
             * @description Payment amount
             * @example 29.99
             */
            total: number;
        };
        CreateSubscriptionWithPaymentsDto: {
            /** Format: date-time */
            startDate?: string;
            /** Format: date-time */
            finishDate?: string;
            sourceId?: string;
            /**
             * @description Period: Xd / Xm / Xy
             * @example 1m
             */
            period: string;
            /** @example true */
            active?: boolean;
            /** @example 29.99 */
            total: number;
            orderId: string;
            prefix: string;
            /** @example false */
            lifetime?: boolean;
            /** @description Future payment schedule. If not provided, will be auto-generated based on period. */
            nextPayments?: components["schemas"]["NextPaymentDto"][];
        };
        UpdateSubscriptionDto: {
            /**
             * Format: date-time
             * @example 2025-11-10T03:43:41.188Z
             */
            startDate?: string;
            /**
             * Format: date-time
             * @example 2026-11-10T03:43:41.188Z
             */
            finishDate?: string;
            /** @example source_12345 */
            sourceId?: string;
            /**
             * @description Period: Xd / Xm / Xy
             * @example 1m
             */
            period?: string;
            /** @example true */
            active?: boolean;
            /** @example 29.99 */
            total?: number;
            /** @example order_90876 */
            orderId?: string;
            /** @example SUB */
            prefix?: string;
            /** @example false */
            lifetime?: boolean;
        };
        GetSubscriptionInfoResponseDto: {
            /**
             * @description Subscription ID
             * @example 1
             */
            id: number;
            /**
             * @description Subscription period type
             * @example 1m
             */
            period: string;
            /**
             * @description Subscription price in USD
             * @example 9.99
             */
            price: number;
            /**
             * @description Current subscription status
             * @example lifetime | active  | inactive
             * @enum {string}
             */
            status: "lifetime" | "active" | "inactive";
            /**
             * @description Start date of subscription
             * @example 2025-08-01T00:00:00Z
             */
            start: Record<string, never> | null;
            /**
             * @description Finish date of subscription
             * @example 2026-08-01T00:00:00Z
             */
            finish: Record<string, never> | null;
            /**
             * @description Type of subscription (allowed values: main, prefix)
             * @example main | prefix
             */
            type: Record<string, never> | null;
        };
        CancelSubscriptionDto: {
            /**
             * @description Order UUID
             * @example a81bc81b-dead-4e5d-abff-90865d1e13b1
             */
            orderId: string;
            /** @example Customer requested cancellation */
            reason: string;
        };
        SubscriptionCancelResponseDto: {
            /**
             * @description Cancellation record ID
             * @example 1
             */
            id: number;
            /**
             * @description Associated subscription ID
             * @example 1
             */
            subscriptionId: number | null;
            /**
             * @description Cancellation reason
             * @example Customer requested cancellation
             */
            reason: string;
            /**
             * Format: date
             * @description Cancellation date (date only)
             * @example 2025-08-13
             */
            date: string | null;
        };
        PauseSubscriptionDto: {
            /** @example 1 */
            subscriptionId: number;
            /**
             * @description Order UUID
             * @example a81bc81b-dead-4e5d-abff-90865d1e13b1
             */
            orderId: string;
            /**
             * @description Date in YYYY-MM-DD format
             * @example 2025-01-02
             */
            dateFrom: string;
            /**
             * @description Date in YYYY-MM-DD format
             * @example 2025-09-15
             */
            dateTo: string;
            description?: string;
        };
        SubscriptionPriceResponseDto: {
            /** @example 1 */
            id: number;
            /** @example 1 */
            subscriptionId: number;
            /**
             * @description Price amount (0 for pause, discounted amount for discount)
             * @example 0
             */
            total: number;
            /**
             * @description Start date of price override
             * @example 2025-09-01
             */
            dateFrom: string;
            /**
             * @description End date of price override
             * @example 2025-09-15
             */
            dateTo: string;
            /** @example Vacation pause */
            description?: Record<string, never> | null;
        };
        ConflictErrorDto: {
            /** @example 409 */
            statusCode: number;
            /** @example Account with external_id '123' and target_source 'snapchat' already exists */
            message: string;
            /** @example Conflict */
            error: string;
        };
        DiscountSubscriptionDto: {
            /** @example 1 */
            subscriptionId: number;
            /**
             * @description Order UUID
             * @example a81bc81b-dead-4e5d-abff-90865d1e13b1
             */
            orderId: string;
            /**
             * @description Date (YYYY-MM-DD) or timestamp (ms)
             * @example 2025-09-01
             */
            dateFrom: string | number;
            /**
             * @description Date (YYYY-MM-DD) or timestamp (ms)
             * @example 2025-09-15
             */
            dateTo: string | number;
            /**
             * @description Discount percent (0-100)
             * @example 25
             */
            discount: number;
            description?: string;
        };
        SubscriptionPaymentResponseDto: {
            /** @example 1 */
            id: number;
            /** @example 1 */
            subscriptionId: number;
            /**
             * Format: date-time
             * @description Payment date
             * @example 2025-08-13T10:00:00.000Z
             */
            date: string;
            /**
             * @description Payment status
             * @example paid
             */
            status: string;
            /**
             * @description Payment amount
             * @example 29.99
             */
            total: number;
        };
        UpdatePaymentDto: {
            /**
             * @description Payment due date
             * @example 2025-09-02
             */
            date?: string;
            /**
             * @description Payment amount
             * @example 29.99
             */
            total?: number;
            /**
             * @description Payment status: waiting, to_pay, paid, error, cancel
             * @example waiting
             * @enum {string}
             */
            status?: "waiting" | "to_pay" | "paid" | "error" | "cancel";
        };
        PaymentUpdateStatusResponseDto: {
            /**
             * @description Human-readable update summary message
             * @example Updated 1 payment records to 'to_pay' status
             */
            message: string;
            /**
             * @description Number of payment records updated
             * @example 1
             */
            updatedCount: number;
        };
        CreatePriceOverrideDto: {
            /**
             * @description Price amount (0 for free access, any amount for discount)
             * @example 50
             */
            total: number;
            /**
             * @description Start date of price override (optional)
             * @example 2025-02-01
             */
            dateFrom?: Record<string, never>;
            /**
             * @description End date of price override (optional)
             * @example 2025-02-28
             */
            dateTo?: Record<string, never>;
            /**
             * @description Description of the price override
             * @example February promotional discount
             */
            description?: string;
        };
        PriceOverrideResponseDto: {
            /**
             * @description Indicates whether the operation was successful
             * @example true
             */
            success: boolean;
            /**
             * @description Human-readable message describing the result
             * @example Price override created successfully and payments recalculated
             */
            message: string;
        };
        RecalculatePaymentsResponseDto: {
            /**
             * @description Indicates whether the recalculation was successful
             * @example true
             */
            success: boolean;
            /**
             * @description Message describing the outcome of the recalculation
             * @example Payments recalculated successfully
             */
            message: string;
        };
        BulkUpdateFileDto: {
            /**
             * Format: binary
             * @description CSV file with columns: sourceId, total
             */
            file: string;
        };
        BulkUpdateCsvResponseDto: {
            /**
             * @description Number of subscriptions successfully updated
             * @example 0
             */
            updated: number;
            /**
             * @description List of source IDs that were not found in the system
             * @example [
             *       "SRC-001",
             *       "SRC-002",
             *       "SRC-003",
             *       "SRC-004",
             *       "SRC-005"
             *     ]
             */
            notFound: string[];
            /**
             * @description List of error messages encountered during processing
             * @example []
             */
            errors: string[];
            /**
             * @description Number of payment records updated due to total changes
             * @example 0
             */
            paymentsUpdated: number;
        };
        CreateSubscriptionCancelReasonDto: {
            /**
             * @description Reason title shown to users/admins
             * @example Too expensive
             */
            title: string;
        };
        SubscriptionCancelReasonDto: {
            /**
             * @description Primary key ID
             * @example 1
             */
            id: number;
            /**
             * @description Reason title
             * @example Too expensive
             */
            title: string;
        };
        SubscriptionCancelReasonResponseDto: {
            /**
             * @description Additional message or status message
             * @example Cancel reason retrieved successfully
             */
            message: string;
            /** @description Subscription cancel reason object */
            reason: components["schemas"]["SubscriptionCancelReasonDto"];
        };
        SubscriptionCancelReasonListResponseDto: {
            /**
             * @description Additional message or status message
             * @example Cancel reason retrieved successfully
             */
            message: string;
            /**
             * @description Pagination metadata
             * @example {
             *       "total": 100,
             *       "pages": 10,
             *       "currentPage": 1
             *     }
             */
            meta: Record<string, never>;
            /** @description List of subscription cancel reasons */
            reasons: components["schemas"]["SubscriptionCancelReasonDto"][];
        };
        UpdateSubscriptionCancelReasonDto: {
            /**
             * @description Reason title shown to users/admins
             * @example Too expensive
             */
            title?: string;
        };
        CreateSubscriptionCancelRequestDto: {
            /**
             * @description Related subscription ID; nullable in schema
             * @example 123
             */
            subscriptionId?: number;
            /**
             * @description Requester email
             * @example user@example.com
             */
            email: string;
            /**
             * @description Primary topic/category selected by user
             * @example Pricing
             */
            topic1: string;
            /**
             * @description Secondary topic/category selected by user
             * @example Lack of features
             */
            topic2: string;
            /**
             * @description Free-form explanation from the user
             * @example I am cancelling because the current plan is too costly.
             */
            description: string;
            /**
             * @description Requested action (e.g., cancel_now, pause, downgrade)
             * @example cancel_now
             */
            action: string;
            /**
             * @description Internal status code (e.g., 0=pending, 1=processed, etc.)
             * @example 0
             */
            status: number;
        };
        SubscriptionCancelRequestDto: {
            /**
             * @description Primary key ID
             * @example 42
             */
            id: number;
            /**
             * @description Related subscription ID; can be null
             * @example 123
             */
            subscriptionId: Record<string, never> | null;
            /**
             * @description Requester email
             * @example user@example.com
             */
            email: string;
            /**
             * @description Primary topic
             * @example Pricing
             */
            topic1: string;
            /**
             * @description Secondary topic
             * @example Lack of features
             */
            topic2: string;
            /**
             * @description Free-form explanation from the user
             * @example I am cancelling because the current plan is too costly.
             */
            description: string;
            /**
             * @description Requested action
             * @example cancel_now
             */
            action: string;
            /**
             * @description Internal status code (0=pending, 1=processed, etc.)
             * @example 0
             */
            status: number;
            /**
             * @description Creation time (nullable). Returned as ISO string.
             * @example 2025-11-05T12:30:00.000Z
             */
            createdAt: Record<string, never> | null;
        };
        SubscriptionCancelRequestResponseDto: {
            /**
             * @description Additional message or status message
             * @example Cancel request retrieved successfully
             */
            message: string;
            /** @description Subscription cancel request object */
            request: components["schemas"]["SubscriptionCancelRequestDto"];
        };
        SubscriptionCancelRequestListResponseDto: {
            /**
             * @description Additional message or status message
             * @example Cancel request retrieved successfully
             */
            message: string;
            /**
             * @description Pagination metadata
             * @example {
             *       "total": 100,
             *       "pages": 10,
             *       "currentPage": 1
             *     }
             */
            meta: Record<string, never>;
            /** @description List of subscription cancel requests */
            requests: components["schemas"]["SubscriptionCancelRequestDto"][];
        };
        SubscriptionCancelRequestDetailDto: {
            /**
             * @description Primary key ID
             * @example 42
             */
            id: number;
            /**
             * @description Related subscription ID; can be null
             * @example 123
             */
            subscriptionId: Record<string, never> | null;
            /**
             * @description Requester email
             * @example user@example.com
             */
            email: string;
            /**
             * @description Primary topic
             * @example Pricing
             */
            topic1: string;
            /**
             * @description Secondary topic
             * @example Lack of features
             */
            topic2: string;
            /**
             * @description Free-form explanation from the user
             * @example I am cancelling because the current plan is too costly.
             */
            description: string;
            /**
             * @description Requested action
             * @example cancel_now
             */
            action: string;
            /**
             * @description Internal status code (0=pending, 1=processed, etc.)
             * @example 0
             */
            status: number;
            /**
             * @description Creation time (nullable). Returned as ISO string.
             * @example 2025-11-05T12:30:00.000Z
             */
            createdAt: Record<string, never> | null;
            /** @description List of subscription cancel requests */
            subscription: components["schemas"]["SubscriptionDto"];
        };
        SubscriptionCancelRequestDetailResponseDto: {
            /**
             * @description Additional message or status message
             * @example Cancel request retrieved successfully
             */
            message: string;
            /** @description Subscription cancel request object */
            request: components["schemas"]["SubscriptionCancelRequestDetailDto"];
        };
        UpdateSubscriptionCancelRequestDto: {
            /**
             * @description Related subscription ID; nullable in schema
             * @example 123
             */
            subscriptionId?: number;
            /**
             * @description Requester email
             * @example user@example.com
             */
            email?: string;
            /**
             * @description Primary topic/category selected by user
             * @example Pricing
             */
            topic1?: string;
            /**
             * @description Secondary topic/category selected by user
             * @example Lack of features
             */
            topic2?: string;
            /**
             * @description Free-form explanation from the user
             * @example I am cancelling because the current plan is too costly.
             */
            description?: string;
            /**
             * @description Requested action (e.g., cancel_now, pause, downgrade)
             * @example cancel_now
             */
            action?: string;
            /**
             * @description Internal status code (e.g., 0=pending, 1=processed, etc.)
             * @example 0
             */
            status?: number;
        };
        CreateAttributeDto: {
            /** @example Age */
            title: string;
            /** @example 1 */
            groupId: number;
        };
        AttributeResponseDto: {
            /** @example 1 */
            id: number;
            /** @example Age */
            title: string;
            /** @example 1 */
            groupId: number;
        };
        PaginatedAttributeResponse: {
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 100 */
            total: number;
            data: components["schemas"]["AttributeResponseDto"][];
        };
        UpdateAttributeDto: {
            /** @example Age */
            title?: string;
            /** @example 1 */
            groupId?: number;
        };
        CreateCampaignDto: {
            /** @example Summer Promo */
            campaign: string;
            /**
             * @description Attribute IDs
             * @example [
             *       1,
             *       2
             *     ]
             */
            attributeIds: string[];
        };
        CampaignResponseDto: {
            /** @example 1 */
            id: number;
            /** @example Summer Promo */
            campaign: string;
            /**
             * @example [
             *       1,
             *       2
             *     ]
             */
            attributeIds: string[];
        };
        PaginatedCampaignResponse: {
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 100 */
            total: number;
            data: components["schemas"]["CampaignResponseDto"][];
        };
        UpdateCampaignDto: {
            /** @example Summer Promo */
            campaign?: string;
            /**
             * @description Attribute IDs
             * @example [
             *       1,
             *       2
             *     ]
             */
            attributeIds?: string[];
        };
        CreateCampaignAdditionDto: {
            /**
             * @description Campaign ID
             * @example 1
             */
            campaignId: number;
            /**
             * Format: date-time
             * @example 2025-01-01
             */
            date_from: string;
            /**
             * Format: date-time
             * @example 2025-01-31
             */
            date_to: string;
            /**
             * @description Attribute IDs
             * @example [
             *       1,
             *       2
             *     ]
             */
            attributeIds: string[];
        };
        CampaignAdditionResponseDto: {
            /** @example 1 */
            id: number;
            /** @example 1 */
            campaignId: number;
            /**
             * Format: date-time
             * @example 2025-01-01
             */
            date_from: string;
            /**
             * Format: date-time
             * @example 2025-01-31
             */
            date_to: string;
            /**
             * @example [
             *       1,
             *       2
             *     ]
             */
            attributeIds: string[];
        };
        PaginatedCampaignAdditionResponse: {
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 100 */
            total: number;
            data: components["schemas"]["CampaignAdditionResponseDto"][];
        };
        UpdateCampaignAdditionDto: {
            /**
             * @description Campaign ID
             * @example 1
             */
            campaignId?: number;
            /**
             * Format: date-time
             * @example 2025-01-01
             */
            date_from?: string;
            /**
             * Format: date-time
             * @example 2025-01-31
             */
            date_to?: string;
            /**
             * @description Attribute IDs
             * @example [
             *       1,
             *       2
             *     ]
             */
            attributeIds?: string[];
        };
        GpStatsFunnelResponseDto: {
            /** @example 1 */
            id: number;
            /** @example Conversion Funnel */
            funnel: string;
            /**
             * @example [
             *       1,
             *       2
             *     ]
             */
            attributeIds: string[];
        };
        PaginatedFunnelResponse: {
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 100 */
            total: number;
            data: components["schemas"]["GpStatsFunnelResponseDto"][];
        };
        CreateFunnelAdditionDto: {
            /**
             * @description Funnel ID
             * @example 1
             */
            funnelId: number;
            /**
             * Format: date-time
             * @example 2025-01-01
             */
            date_from: string;
            /**
             * Format: date-time
             * @example 2025-01-31
             */
            date_to: string;
            /**
             * @description Attribute IDs
             * @example [
             *       1,
             *       2
             *     ]
             */
            attributeIds: string[];
        };
        FunnelAdditionResponseDto: {
            /** @example 1 */
            id: number;
            /** @example 1 */
            funnelId: number;
            /**
             * Format: date-time
             * @example 2025-01-01
             */
            date_from: string;
            /**
             * Format: date-time
             * @example 2025-01-31
             */
            date_to: string;
            /**
             * @example [
             *       1,
             *       2
             *     ]
             */
            attributeIds: string[];
        };
        PaginatedFunnelAdditionResponse: {
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 100 */
            total: number;
            data: components["schemas"]["FunnelAdditionResponseDto"][];
        };
        UpdateFunnelAdditionDto: {
            /**
             * @description Funnel ID
             * @example 1
             */
            funnelId?: number;
            /**
             * Format: date-time
             * @example 2025-01-01
             */
            date_from?: string;
            /**
             * Format: date-time
             * @example 2025-01-31
             */
            date_to?: string;
            /**
             * @description Attribute IDs
             * @example [
             *       1,
             *       2
             *     ]
             */
            attributeIds?: string[];
        };
        CreateGroupDto: {
            /** @example User Demographics */
            title: string;
        };
        GroupResponseDto: {
            /** @example 1 */
            id: number;
            /** @example User Demographics */
            title: string;
        };
        PaginatedGroupResponse: {
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 100 */
            total: number;
            data: components["schemas"]["GroupResponseDto"][];
        };
        UpdateGroupDto: {
            /** @example Demographics */
            title?: string;
        };
        HealthStatusResponseDto_GET_Single_Health_status_retrieve_successful_Default: {
            /** @example true */
            success: Record<string, never>;
            /** @example GET */
            method: Record<string, never>;
            /** @example OK */
            status: Record<string, never>;
            /** @example 200 */
            statusCode: Record<string, never>;
            /** @example healths */
            path: Record<string, never>;
            /** @example 2025-11-17T17:31:29.679Z */
            timestamp: Record<string, never>;
            /** @example Health status retrieve successful */
            message: Record<string, never>;
            data?: components["schemas"]["HealthStatusResponseDto"];
        };
        CreatePeriodDto: {
            /**
             * @description Type of period
             * @example minute
             * @enum {string}
             */
            type: "minute" | "hour" | "daily";
            /**
             * @description Value in minutes or hours (depending on type)
             * @example 5
             */
            value?: number;
            /**
             * @description Time of day for daily jobs (HH:mm)
             * @example 14:30
             */
            time?: string;
        };
        CreateScheduledActionDto: {
            /**
             * @description Human readable name of the scheduled job
             * @example Ping Google
             */
            title: string;
            /**
             * @description Target URL to make the request
             * @example https://google.com
             */
            url: string;
            /**
             * @description HTTP method to use for the request
             * @example GET
             * @enum {string}
             */
            method: "GET" | "POST";
            /** @description Body for POST requests (optional for GET) */
            body?: Record<string, never>;
            /** @description Period definition for when this job should run */
            period: components["schemas"]["CreatePeriodDto"];
        };
        PeriodDto: {
            /**
             * @description Type of period
             * @example minute
             * @enum {string}
             */
            type: "minute" | "hour" | "daily";
            /**
             * @description Value in minutes or hours (depending on type)
             * @example 5
             */
            value?: number;
            /**
             * @description Time of day for daily jobs (HH:mm)
             * @example 14:30
             */
            time?: string;
        };
        ScheduledActionDto: {
            /** @example 1 */
            id: number;
            /** @example Ping Google */
            title: string;
            /** @example https://google.com */
            url: string;
            /**
             * @example GET
             * @enum {string}
             */
            method: "GET" | "POST";
            /**
             * @example {
             *       "userId": 123,
             *       "message": "Auto sync triggered"
             *     }
             */
            body: Record<string, never> | null;
            /**
             * @description Period configuration of the job
             * @example {
             *       "type": "minute",
             *       "value": 5
             *     }
             */
            period: components["schemas"]["PeriodDto"];
            /**
             * @description Timestamp of job creation
             * @example 2025-01-15T12:34:56.789Z
             */
            createdAt: Record<string, never>;
        };
        ScheduledActionResponseDto: {
            shedulledAction: components["schemas"]["ScheduledActionDto"];
        };
        ScheduledActionResponseDto_POST_Single_Scheduled_action_created_successfully_Default: {
            /** @example true */
            success: Record<string, never>;
            /** @example POST */
            method: Record<string, never>;
            /** @example CREATED */
            status: Record<string, never>;
            /** @example 201 */
            statusCode: Record<string, never>;
            /** @example shedulled-actions */
            path: Record<string, never>;
            /** @example 2025-11-17T17:31:29.744Z */
            timestamp: Record<string, never>;
            /** @example Scheduled action created successfully */
            message: Record<string, never>;
            data?: components["schemas"]["ScheduledActionResponseDto"];
        };
        UpdateScheduledActionDto: {
            /**
             * @description Human readable name of the scheduled job
             * @example Ping Google
             */
            title?: string;
            /**
             * @description Target URL to make the request
             * @example https://google.com
             */
            url?: string;
            /**
             * @description HTTP method to use for the request
             * @enum {string}
             */
            method?: "GET" | "POST";
            /** @description Body for POST requests (optional for GET) */
            body?: Record<string, never>;
            /** @description Period definition for when this job should run */
            period?: components["schemas"]["CreatePeriodDto"];
        };
        ScheduledActionResponseDto_PATCH_Single_Scheduled_action_updated_successfully_Default: {
            /** @example true */
            success: Record<string, never>;
            /** @example PATCH */
            method: Record<string, never>;
            /** @example OK */
            status: Record<string, never>;
            /** @example 200 */
            statusCode: Record<string, never>;
            /** @example shedulled-actions/{id} */
            path: Record<string, never>;
            /** @example 2025-11-17T17:31:29.745Z */
            timestamp: Record<string, never>;
            /** @example Scheduled action updated successfully */
            message: Record<string, never>;
            data?: components["schemas"]["ScheduledActionResponseDto"];
        };
        NoData_DELETE_Response_Scheduled_action_deleted_successfully_Default: {
            /** @example true */
            success: Record<string, never>;
            /** @example DELETE */
            method: Record<string, never>;
            /** @example NO_CONTENT */
            status: Record<string, never>;
            /** @example 204 */
            statusCode: Record<string, never>;
            /** @example shedulled-actions/{id} */
            path: Record<string, never>;
            /** @example 2025-11-17T17:31:29.746Z */
            timestamp: Record<string, never>;
            /** @example Scheduled action deleted successfully */
            message: Record<string, never>;
        };
        ScheduledActionResponseDto_GET_Single_Scheduled_action_detail_retrieved_successfully_Default: {
            /** @example true */
            success: Record<string, never>;
            /** @example GET */
            method: Record<string, never>;
            /** @example OK */
            status: Record<string, never>;
            /** @example 200 */
            statusCode: Record<string, never>;
            /** @example shedulled-actions/{id} */
            path: Record<string, never>;
            /** @example 2025-11-17T17:31:29.747Z */
            timestamp: Record<string, never>;
            /** @example Scheduled action detail retrieved successfully */
            message: Record<string, never>;
            data?: components["schemas"]["ScheduledActionResponseDto"];
        };
        ScheduledActionListResponseDto: {
            meta: components["schemas"]["MetaDto"];
            shedulledActions: components["schemas"]["ScheduledActionDto"][];
        };
        ScheduledActionListResponseDto_GET_Array_Scheduled_action_list_retrieved_successfully_Default: {
            /** @example true */
            success: Record<string, never>;
            /** @example GET */
            method: Record<string, never>;
            /** @example OK */
            status: Record<string, never>;
            /** @example 200 */
            statusCode: Record<string, never>;
            /** @example shedulled-actions */
            path: Record<string, never>;
            /** @example 2025-11-17T17:31:29.747Z */
            timestamp: Record<string, never>;
            /** @example Scheduled action list retrieved successfully */
            message: Record<string, never>;
            data?: components["schemas"]["ScheduledActionListResponseDto"][];
        };
        PinterestHealthMySQLConnectionStatsDto: {
            /**
             * @description Current open connections
             * @example 12
             */
            current: number;
            /**
             * @description Peak concurrent connections since server start
             * @example 95
             */
            max_used: number;
            /**
             * @description Configured maximum allowed connections
             * @example 151
             */
            max_allowed: number;
        };
        PinterestHealthCheckResultDto: {
            /**
             * @example UP
             * @enum {string}
             */
            service: "UP" | "DOWN" | "UNKNOWN";
            /**
             * @example UP
             * @enum {string}
             */
            database: "UP" | "DOWN" | "UNKNOWN";
            /**
             * @description DB ping latency in milliseconds
             * @example 7
             */
            db_latency_ms: number;
            mysql_connections?: components["schemas"]["PinterestHealthMySQLConnectionStatsDto"];
            /**
             * Format: date-time
             * @example 2025-11-07T05:12:34.123Z
             */
            timestamp: string;
            /** @example ECONNREFUSED 127.0.0.1:3306 */
            error?: string;
        };
        PinterestHealthCheckResponseDto: {
            healthStatus: components["schemas"]["PinterestHealthCheckResultDto"];
        };
        CartData: Record<string, never>;
        AppendCartDto: {
            extraData?: {
                [key: string]: unknown;
            };
        };
        /**
         * @description The splitting strategy to use. Available strategies: split-to-2-eq, split-to-3-eq, split-to-2-desc, split-to-3-desc, split-to-2-asc, split-to-3-asc, split-by-price
         * @enum {string}
         */
        SplitStrategy: "split-to-2-eq" | "split-to-3-eq" | "split-to-2-desc" | "split-to-3-desc" | "split-to-2-asc" | "split-to-3-asc" | "split-by-price";
        SplitCartDto: {
            /**
             * @description The splitting strategy to use. Available strategies: split-to-2-eq, split-to-3-eq, split-to-2-desc, split-to-3-desc, split-to-2-asc, split-to-3-asc, split-by-price
             * @example split-to-2-eq
             */
            strategy: components["schemas"]["SplitStrategy"];
            /**
             * @description Maximum price per cart (required only for split-by-price strategy). Items exceeding this amount will be placed in separate carts.
             * @example 150
             */
            maxPrice?: number;
        };
        SplitCartResponseDto: {
            /** @description The original cart that was requested to be split. It remains unchanged. */
            originalCart: components["schemas"]["CartData"];
            /** @description The list of newly created carts resulting from the split operation. */
            splitCarts: components["schemas"]["CartData"][];
        };
        SnapchatSpendResponseDto: {
            /**
             * @description The date of the spend entry
             * @example 2025-10-06
             */
            date: string;
            /**
             * @description The amount spent
             * @example 32.250000
             */
            ad_spend: string;
            /**
             * @description The country where the ad was shown
             * @example US
             */
            country: string;
        };
        PaginationMetadata: {
            total: number;
            page: number;
            limit: number;
        };
        SnapchatSpendPaginatedResponseDto: {
            data: components["schemas"]["SnapchatSpendResponseDto"][];
            meta: components["schemas"]["PaginationMetadata"];
        };
        SnapchatAccountResponseDto: {
            /** @example 1 */
            id: number;
            /** @example Snapchat Account 7cb170a3-... */
            title: string;
            /** @example 7cb170a3-dc41-4ab3-bdcd-4434ebe664bc */
            external_id: string;
            /** @example snapchat */
            target_source: string;
            /**
             * @description Snapchat OAuth Client ID
             * @example 439e231c-5720-43fe-bf1b-f66d7c7a9be4
             */
            client_id: string;
            /**
             * @description Snapchat OAuth Client Secret (masked for security)
             * @example ***masked***
             */
            client_secret: string;
            /**
             * @description Snapchat Ad Account ID
             * @example 7cb170a3-dc41-4ab3-bdcd-4434ebe664bc
             */
            ad_account_id: string;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
        };
        SnapchatAccountPaginatedResponseDto: {
            data: components["schemas"]["SnapchatAccountResponseDto"][];
            meta: components["schemas"]["PaginationMetadata"];
        };
        SnapchatErpDataResponseDto: {
            /**
             * @description ERP data organized by date, source, and country+language
             * @example {
             *       "2024-01-15": {
             *         "snapchat": {
             *           "US::en": 1500.5,
             *           "UK::en": 800.25,
             *           "DE::de": 1200.75
             *         }
             *       },
             *       "2024-01-16": {
             *         "snapchat": {
             *           "US::en": 2000,
             *           "FR::fr": 900.3
             *         }
             *       }
             *     }
             */
            data: {
                [key: string]: {
                    [key: string]: {
                        [key: string]: number;
                    };
                };
            };
        };
        DeleteSuccessDto: {
            /**
             * @description Success message for account deletion
             * @example Account 123 deleted successfully
             */
            message: string;
        };
        DeleteConflictErrorDto: {
            /** @example 409 */
            statusCode: number;
            /** @example Cannot delete account 123. It has 5 associated spend records. Please delete spend records first or reassign them to another account. */
            message: string;
            /** @example Conflict */
            error: string;
        };
        AuthUrlResponseDto: {
            /**
             * @description Snapchat OAuth authorization URL
             * @example https://accounts.snapchat.com/login/oauth2/authorize?client_id=...&response_type=code&scope=snapchat-marketing-api&redirect_uri=...
             */
            authorizationUrl: string;
        };
        OAuthCallbackRequestDto: {
            /**
             * @description Authorization code from Snapchat OAuth
             * @example abc123def456
             */
            code: string;
            /**
             * @description Redirect URI used in the OAuth flow
             * @example https://example.com
             */
            redirect_uri: string;
        };
        OAuthCallbackResponseDto: {
            /**
             * @description Success message
             * @example Tokens stored successfully
             */
            message: string;
        };
        TokenStatsResponseDto: {
            /**
             * @description Account ID
             * @example 1
             */
            accountId: number;
            /**
             * @description OAuth provider
             * @example snapchat
             */
            provider: string;
            /**
             * @description Token expiration date
             * @example 2024-01-15T10:30:00Z
             */
            expiresAt: Record<string, never> | null;
            /**
             * @description Last token refresh date
             * @example 2024-01-14T10:30:00Z
             */
            lastRefreshedAt: Record<string, never> | null;
            /**
             * @description Number of token refreshes
             * @example 5
             */
            refreshCount: number;
            /**
             * @description Whether the token is expired
             * @example false
             */
            isExpired: boolean;
            /**
             * @description Whether the account has valid tokens
             * @example true
             */
            hasValidTokens: boolean;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}

type SDKCapiboxSessionResponse = components['schemas']['SessionResponseV2Dto'];

type SDKCapiboxCartItem = components["schemas"]["CartItemDto"];
type SDKCapiboxCartResponse = components["schemas"]["CartResponseDto"];
type SDKCapiboxCustomerCartResponse = components["schemas"]["CustomerPaidCartResponseDto"];

type SDKCapiboxPaymentToken = components['schemas']['PaymentCreateSessionBridgeResponseItemDto'];

declare const browser: {
    capi: {
        facebook: (data: components["schemas"]["FbCapiPayloadSessionBridge"]) => Promise<{
            success: boolean;
        }>;
        snapchat: (data: components["schemas"]["SnapchatCapiBridgeDto"]) => Promise<{
            success: boolean;
        }>;
        tiktok: (data: components["schemas"]["TiktokCapiPayloadSessionBridge"]) => Promise<{
            success: boolean;
        }>;
    };
    cart: {
        append: (uuid: string, body: components["schemas"]["AppendCartItemDto"]) => Promise<SDKCapiboxCartResponse>;
        create: (body: components["schemas"]["CreateCartDto"]) => Promise<SDKCapiboxCartResponse>;
        get: (uuid: string) => Promise<SDKCapiboxCustomerCartResponse>;
        markPaid: (uuid: string, body: components["schemas"]["MarkPurchasedCartDto"]) => Promise<components["schemas"]["CustomerPaidCartResponseDto"]>;
        cart: (uuid: string, body: components["schemas"]["SplitCartDto"]) => Promise<components["schemas"]["SplitCartResponseDto"]>;
    };
    mail: {
        sendToRecipient: (data: components["schemas"]["SendMailToRecipientDto"]) => Promise<components["schemas"]["SendMailResponseDto"]>;
        sendToSupport: (data: components["schemas"]["SendMailToSupportDto"]) => Promise<components["schemas"]["SendMailResponseDto"]>;
    };
    session: {
        append: (uuid: string, body: components["schemas"]["AppendSessionDto"]) => Promise<components["schemas"]["SessionResponseDto"]>;
        create: ({ language, email, currency, quiz, ...data }: {
            language: string;
            email?: string;
            currency: string;
        } & Omit<{
            extraData?: {
                [key: string]: unknown;
            };
            quiz?: {
                [key: string]: unknown;
            };
            cookies: string;
            uuid?: string;
            analyticsId?: string;
            analyticsIdv3?: string;
            origin?: string;
            query: {
                [key: string]: unknown;
            };
            referer?: string;
            slug: string;
        }, "origin" | "referer" | "cookies" | "slug" | "query" | "ip" | "user-agent" | "analyticsId" | "analyticsIdv3">) => Promise<components["schemas"]["SessionResponseDto"]>;
        get: (uuid: string) => Promise<SDKCapiboxSessionResponse>;
        markPaid: (uuid: string) => Promise<{
            success: boolean;
        }>;
    };
    sessionWithCurrency: {
        get: (uuid: string) => Promise<components["schemas"]["SessionResponseWithCurrencyFullDto"]>;
        create: ({ language, email, currency, quiz, ...data }: {
            language: string;
            email?: string;
            currency: string;
        } & Omit<{
            extraData?: {
                [key: string]: unknown;
            };
            quiz?: {
                [key: string]: unknown;
            };
            cookies: string;
            uuid?: string;
            analyticsId?: string;
            analyticsIdv3?: string;
            origin?: string;
            query: {
                [key: string]: unknown;
            };
            referer?: string;
            slug: string;
        }, "origin" | "referer" | "cookies" | "slug" | "query" | "ip" | "user-agent" | "analyticsId" | "analyticsIdv3">) => Promise<components["schemas"]["SessionResponseWithCurrencyFullDto"]>;
    };
    currency: {
        rate: (dto: components["schemas"]["GetCurrencyDto"]) => Promise<components["schemas"]["CurrencyRateResponseDto"][]>;
        suggest: (country: string) => Promise<never>;
        symbol: (country: string) => Promise<never>;
    };
    crmAuth: {
        signIn: (data: any) => Promise<any>;
        signOut: () => Promise<{
            success: 1;
        }>;
        verify: () => Promise<any>;
    };
    realtime: {
        trackEvent: (type: string, uuid?: string, options?: {
            ga?: any;
            skipGa?: boolean;
            path?: {
                pathname?: string;
                referer?: string;
                origin?: string;
                length?: number;
            };
            attr?: {
                [key: string]: string | number;
            };
            eventData?: {
                [key: string]: string | number;
            };
            skipEvent?: boolean;
        }) => Promise<void>;
        orderUtmData: (uuid: string) => Promise<{
            first: components["schemas"]["RealtimeUtmSearchDetailDto"];
            last: components["schemas"]["RealtimeUtmSearchDetailDto"];
            lastPaid: components["schemas"]["RealtimeUtmSearchDetailDto"];
        }>;
    };
    verify: {
        email: (email: string) => Promise<{
            valid: boolean;
            error?: string;
        } | undefined>;
        phone: (phone: string) => Promise<{
            valid: boolean;
            landline: number;
            error: string;
        } | undefined>;
    };
    quiz: {
        get: (uuid: string) => Promise<components["schemas"]["QuizResponseDto"]>;
    };
    payments: {
        createSession: (data: components["schemas"]["PaymentCreateSessionBridgeRequestDto"]) => Promise<{
            token: string;
            source: string;
            provider: string;
        }[]>;
        updateSession: (data: components["schemas"]["PaymentUpdateSessionBridgeRequestDto"]) => Promise<{
            success: boolean;
        }>;
        upsell: {
            charge: ({ uuid, amount, type, description, metadata, orderId: passedOrderId }: {
                uuid: string;
                amount: number;
                type: "capture" | "authorize";
                metadata?: {
                    [key: string]: any;
                };
                description?: string;
                orderId?: string;
            }) => Promise<{
                id: string;
                date: string;
                dateUpdated: string;
                amount: number;
                currencyCode: string;
                customerId: string;
                metadata: Record<string, never>;
                orderId: string;
                status: "PENDING" | "FAILED" | "AUTHORIZED" | "SETTLING" | "PARTIALLY_SETTLED" | "SETTLED" | "DECLINED" | "CANCELLED";
                order: components["schemas"]["OrderDto"];
                customer: components["schemas"]["CustomerDto"];
                paymentMethod: components["schemas"]["PaymentMethodDto"];
                processor: components["schemas"]["ProcessorDto"];
                transactions: components["schemas"]["TransactionDto"][];
                riskData: components["schemas"]["RiskDataDto"];
            } | {
                success: boolean;
            }>;
            chargeFromCart: ({ cartUUID, type, description, metadata, }: {
                cartUUID: string;
                type: "capture" | "authorize";
                metadata?: {
                    [key: string]: any;
                };
                description?: string;
            }) => Promise<{
                id: string;
                date: string;
                dateUpdated: string;
                amount: number;
                currencyCode: string;
                customerId: string;
                metadata: Record<string, never>;
                orderId: string;
                status: "PENDING" | "FAILED" | "AUTHORIZED" | "SETTLING" | "PARTIALLY_SETTLED" | "SETTLED" | "DECLINED" | "CANCELLED";
                order: components["schemas"]["OrderDto"];
                customer: components["schemas"]["CustomerDto"];
                paymentMethod: components["schemas"]["PaymentMethodDto"];
                processor: components["schemas"]["ProcessorDto"];
                transactions: components["schemas"]["TransactionDto"][];
                riskData: components["schemas"]["RiskDataDto"];
            } | {
                success: boolean;
            }>;
        };
        confirmPayment: (uuid: string, { cart }: {
            cart: components["schemas"]["MarkPurchasedCartDto"];
        }) => Promise<{
            success: number;
            currency: string;
            pm: string;
            data: components["schemas"]["CartItemDto"][];
        }>;
        paypal: {
            startOrder: (uuid: string, dto: components["schemas"]["PaypalOrderV1CreateFromSessionDto"]) => Promise<{
                id: string;
                intent: string;
                status: string;
                payment_source: components["schemas"]["PaypalOrderV1CreatePaymentSourceDto"];
                purchase_units: components["schemas"]["PaypalOrderV1CreatePurchaseUnitDto"][];
                payer: components["schemas"]["PaypalOrderV1CreatePayerDto"];
                create_time?: string;
                update_time?: string;
                links: components["schemas"]["PaypalOrderV1CreateLinkDto"][];
            }>;
            captureOrder: (uuid: string) => Promise<{
                id: string;
                intent: string;
                status: string;
                payment_source: components["schemas"]["PaypalOrderV1CreatePaymentSourceDto"];
                purchase_units: components["schemas"]["PaypalOrderV1CreatePurchaseUnitDto"][];
                payer: components["schemas"]["PaypalOrderV1CreatePayerDto"];
                create_time?: string;
                update_time?: string;
                links: components["schemas"]["PaypalOrderV1CreateLinkDto"][];
            }>;
        };
        paypalRt: {
            start: (uuid: string, dto: components["schemas"]["PaypalBillingAgreementV1CreateFromSessionDto"]) => Promise<{
                token_id: string;
                links: components["schemas"]["PaypalBillingAgreementLinkDto"][];
            }>;
            capture: (tokenBa: string, uuid: string) => Promise<{
                id: string;
                intent: string;
                state: string;
                payer: components["schemas"]["PayerDto"];
                transactions: components["schemas"]["TransactionDto"][];
                create_time: string;
                update_time: string;
                links: components["schemas"]["PaypalLinkDto"][];
            }>;
        };
        yuno: {
            createPayment: (dto: components["schemas"]["YunoCreatePaymentDto"]) => Promise<never>;
        };
        primer: {
            oneUsdChargeAndRefund: (dto: components["schemas"]["PrimerCreateRecurringPaymentRequestDto"]) => Promise<{
                success: boolean;
                data: components["schemas"]["PrimerPaymentResponseDto"];
            }>;
            oneUsdChargeAndRefundDeferred: (dto: components["schemas"]["PrimerCreateReferencePaymentRequestWithDelayDto"]) => Promise<true>;
        };
        firstPayment: (uuid: string) => Promise<{
            source: string;
            chargeId: string;
            total: number;
            currency: string;
            date: string;
            type: string;
        }>;
        last5Payments: (uuid: string) => Promise<{
            source: string;
            chargeId: string;
            total: number;
            currency: string;
            date: string;
            type: string;
        }[]>;
        tax: {
            getPercent: (data: components["schemas"]["TaxPercentCountryStateRequestDto"]) => Promise<{
                taxPercent: number;
            }>;
            calculate: (data: components["schemas"]["TaxValueCountryStateRequestDto"]) => Promise<{
                taxPercent: number;
                taxAmount: number;
                amountWithTax: number;
            }>;
        };
    };
    trustpilot: {
        getLink: (data: components["schemas"]["CreateTrustpilotInvitationLinkDto"]) => Promise<components["schemas"]["CreateTrustpilotInvitationLinkResponseDto"]>;
        sendInvitation: (data: components["schemas"]["SendTrustpilotInvitationDto"]) => Promise<components["schemas"]["SendTrustpilotInvitationResponseDto"]>;
    };
    jumpTask: {
        create: (dto: components["schemas"]["CreateSessionRequestDto"]) => Promise<{
            data: components["schemas"]["JumpTaskSessionResponseDto"];
        }>;
        update: (uuid: string, dto: components["schemas"]["PatchSessionRequestDto"]) => Promise<{
            data: components["schemas"]["JumpTaskSessionResponseDto"];
        }>;
    };
    klaviyo: {
        send: (dto: components["schemas"]["CreateEventDto"]) => Promise<never>;
        sendBulk: (dto: components["schemas"]["CreateBulkEventDto"]) => Promise<never>;
    };
    order: {
        getByUuid: (uuid: string) => Promise<{
            id: number;
            orderId: string;
            country: string;
            origin: string;
            gender: string;
            language: string;
            slug: string;
            email: string;
        }>;
        getByEmail: (email: string) => Promise<{
            id: number;
            orderId: string;
            country: string;
            origin: string;
            gender: string;
            language: string;
            slug: string;
            email: string;
        }[]>;
    };
    subscription: {
        cancelById: (id: number, data: components["schemas"]["CancelSubscriptionDto"]) => Promise<{
            id: number;
            subscriptionId: number | null;
            reason: string;
            date: string | null;
        }>;
        cancelByOrderId: (uuid: string, data: components["schemas"]["CancelSubscriptionDto"]) => Promise<{
            id: number;
            subscriptionId: number | null;
            reason: string;
            date: string | null;
        }[]>;
        applyDiscount: (data: components["schemas"]["DiscountSubscriptionDto"]) => Promise<{
            id: number;
            subscriptionId: number;
            total: number;
            dateFrom: string;
            dateTo: string;
            description?: Record<string, never> | null;
        }>;
        pause: (data: components["schemas"]["PauseSubscriptionDto"]) => Promise<{
            id: number;
            subscriptionId: number;
            total: number;
            dateFrom: string;
            dateTo: string;
            description?: Record<string, never> | null;
        }>;
        fillCancellationRequest: (data: components["schemas"]["CreateSubscriptionCancelRequestDto"]) => Promise<{
            message: string;
            request: components["schemas"]["SubscriptionCancelRequestDto"];
        }>;
        get: (uuid: string) => Promise<{
            id: number;
            period: string;
            price: number;
            status: "lifetime" | "active" | "inactive";
            start: Record<string, never> | null;
            finish: Record<string, never> | null;
            type: Record<string, never> | null;
        }[]>;
    };
};

export { type SDKCapiboxCartItem, type SDKCapiboxCartResponse, type SDKCapiboxCustomerCartResponse, type SDKCapiboxPaymentToken, type SDKCapiboxSessionResponse, browser };
