"""
Example Custom SSO Handler

Use this if you want to run custom code after litellm has retrieved information from your IDP (Identity Provider).

Flow:
- User lands on Admin UI
- LiteLLM redirects user to your SSO provider
- Your SSO provider redirects user back to LiteLLM
- LiteLLM has retrieved user information from your IDP
- Your custom SSO handler is called and returns an object of type SSOUserDefinedValues
- User signed in to UI
"""

from fastapi_sso.sso.base import OpenID

from litellm.proxy._types import LitellmUserRoles, SSOUserDefinedValues
from litellm.proxy.management_endpoints.internal_user_endpoints import user_info

KEYCLOAK_ROLE_TO_LITELLM_ROLE = {
    "org-admin": LitellmUserRoles.ORG_ADMIN.value,
    "internal-user": LitellmUserRoles.INTERNAL_USER.value,
    "internal-user-view-only": LitellmUserRoles.INTERNAL_USER_VIEW_ONLY.value,
    "proxy-admin": LitellmUserRoles.PROXY_ADMIN.value,
    "proxy-admin-view-only": LitellmUserRoles.PROXY_ADMIN_VIEW_ONLY.value,
}

async def custom_sso_handler(userIDPInfo: OpenID) -> SSOUserDefinedValues:
    try:        
        print("inside custom sso handler")  # noqa
        print(f"userIDPInfo: {userIDPInfo}")  # noqa

        if userIDPInfo.id is None:
            raise ValueError(
                f"No ID found for user. userIDPInfo.id is None {userIDPInfo}"
            )

               # Extract role from Keycloak token
        # Adjust this depending on your Keycloak claim structure
        roles = userIDPInfo.userinfo.get("realm_access", {}).get("roles", [])
        print(f"Roles from Keycloak: {roles}")

        # Determine the first matching role
        user_role = LitellmUserRoles.VIEWER.value  # default role
        for role in roles:
            if role in KEYCLOAK_ROLE_TO_LITELLM_ROLE:
                user_role = KEYCLOAK_ROLE_TO_LITELLM_ROLE[role]
                break

        # check if user exists in litellm proxy DB
        _user_info = await user_info(user_id=userIDPInfo.id)
        print("_user_info from litellm DB ", _user_info)  # noqa

        return SSOUserDefinedValues(
            models=[],
            user_id=userIDPInfo.id,
            user_email=userIDPInfo.email,
            user_role=LitellmUserRoles.ORG_ADMIN.value,
            max_budget=10,
            budget_duration="1d",
        )
    except Exception:
        raise Exception("Failed custom auth")
